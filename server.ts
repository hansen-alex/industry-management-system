import dotenv from "dotenv"
import express, { Request, Response } from "express"
import { graphqlHTTP } from "express-graphql";
import mongoose, { Types } from "mongoose";
import { Contact } from "./database/models/contact";
import { Manufacturer } from "./database/models/manufacturer";
import { Product } from "./database/models/product";
import { Schema } from "./database/graphql/schema";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use("/graphql", graphqlHTTP({
    schema: Schema,
    graphiql: true
}));

mongoose.connect(process.env.DB_URI as string, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
})

app.get("/api/contacts", async (request: Request, response: Response) => {
    try {
        const contacts = await Contact.find();
        response.status(200).send(contacts);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.get("/api/contacts/:id", async (request: Request, response: Response) => {
    try {
        const contact = await Contact.findById(request.params.id);
        response.status(200).send(contact);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.post("/api/contacts", async (request: Request, response: Response) => {
    try {
        const newContact = await new Contact(request.body);
        newContact._id = new Types.ObjectId();
        await newContact.save();
        
        response.status(200).send(newContact);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.put("/api/contacts/:id", async (request: Request, response: Response) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(request.params.id, request.body);
        response.status(200).send(updatedContact);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete("/api/contacts/:id", async (request: Request, response: Response) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(request.params.id);
        response.status(200).send(deletedContact);
    } catch (error) {
        response.status(500).send(error);
    }
});

/////////////////////////////////////////////////

app.get("/api/manufacturers", async (request: Request, response: Response) => {
    try {
        const manufacturers = await Manufacturer.find();
        response.status(200).send(manufacturers);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.get("/api/manufacturers/:id", async (request: Request, response: Response) => {
    try {
        const manufacturer = await Manufacturer.findById(request.params.id);
        response.status(200).send(manufacturer);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.post("/api/manufacturers", async (request: Request, response: Response) => {
    try {
        const newManufacturer = await new Manufacturer(request.body);
        newManufacturer._id = new Types.ObjectId();
        await newManufacturer.save();

        response.status(200).send(newManufacturer);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.put("/api/manufacturers/:id", async (request: Request, response: Response) => {
    try {
        const updatedManufacturer = await Manufacturer.findByIdAndUpdate(request.params.id, request.body);
        response.status(200).send(updatedManufacturer);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete("/api/manufacturers/:id", async (request: Request, response: Response) => {
    try {
        const deletedManufacturer = await Manufacturer.findByIdAndDelete(request.params.id);
        response.status(200).send(deletedManufacturer);
    } catch (error) {
        response.status(500).send(error);
    }
});

/////////////////////////////////////////////////

app.get("/api/products", async (request: Request, response: Response) => {
    try {
        const products = await Product.find();

        response.status(200).send(await Promise.all(products.map(async product => {
            const manufacturer = await Manufacturer.findById(product?.manufacturer);
            const contact = await Contact.findById(manufacturer?.contact);
            return { product: product, manufacturer: manufacturer, contact: contact };
        })));
    } catch (error) {
        response.status(500).send(error);
    }
});

//Retrieve a list of all products with less than 10 units in stock
app.get("/api/products/low-stock", async (request: Request, response: Response) => {
    try {
        const lowStockProducts = await Product.find({ amountInStock: { $lt: 10 } });
        response.status(200).send(lowStockProducts);
    } catch (error) {
        response.status(500).send(error);
    } 
});

//Retrieve a compact list of products with less than 5 items in stock (including only the manufacturer's and the contact's name, phone and email)
app.get("/api/products/critical-stock", async (request: Request, response: Response) => {
    try {
        const criticalStockProducts = await Product.find({ amountInStock: { $lt: 5 } });
        response.status(200).send(await Promise.all(criticalStockProducts.map(async product => {
            const manufacturer = await Manufacturer.findById(product?.manufacturer);
            const contact = await Contact.findById(manufacturer?.contact);

            return {
                product: product,
                manufacturer: manufacturer?.name,
                contactName: contact?.name,
                contactPhone: contact?.phone,
                contactEmail: contact?.email,
            };
        })));
    } catch (error) {
        response.status(500).send(error);
    } 
});

//Summarize the total value of all products in stock
app.get("/api/products/total-stock-value", async (request: Request, response: Response) => {
    try {
        const products = await Product.find();
        response.status(200).send({ totalStockValue: products.reduce((accumulator, currentValue) => accumulator + currentValue.price * currentValue.amountInStock, 0) });
    } catch (error) {
        response.status(500).send(error);
    } 
});

//Summarize the total value of products in stock per manufacturer
app.get("/api/products/total-stock-value-by-manufacturer", async (request: Request, response: Response) => {
    try {
        const products = await Product.find();

        const valueMap = new Map();
        products.forEach(product => {
            const manufacturerId = product.manufacturer.toString();
            if(valueMap.has(manufacturerId))
                valueMap.set(manufacturerId, valueMap.get(manufacturerId) + product.price * product.amountInStock);
            else
                valueMap.set(manufacturerId, product.price * product.amountInStock);
        });

        response.status(200).send(await Promise.all(Array.from(valueMap).map(async item => {
            const manufacturer = await Manufacturer.findById(item[0]);
            return { manufacturer: manufacturer, manufacturerTotalStockValue: item[1] };
        })));
    } catch (error) {
        response.status(500).send(error);
    } 
});

app.post("/api/products", async (request: Request, response: Response) => {
    try {
        const newProduct = await new Product(request.body);
        newProduct._id = new Types.ObjectId();
        await newProduct.save();

        response.status(200).send(newProduct);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.get("/api/products/:id", async (request: Request, response: Response) => {
    try {
        const product = await Product.findById(request.params.id);
        const manufacturer = await Manufacturer.findById(product?.manufacturer);
        const contact = await Contact.findById(manufacturer?.contact);

        response.status(200).send({ product: product, manufacturer: manufacturer, contact: contact });
    } catch (error) {
        response.status(500).send(error);
    }
});

app.put("/api/products/:id", async (request: Request, response: Response) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(request.params.id, request.body);
        response.status(200).send(updatedProduct);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete("/api/products/:id", async (request: Request, response: Response) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(request.params.id);
        response.status(200).send(deletedProduct);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Sever listening on http://localhost:${PORT}/`);
})
