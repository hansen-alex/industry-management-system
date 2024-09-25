import dotenv from "dotenv"
import express, { Request, Response } from "express"
import mongoose, { Types } from "mongoose";
import { Contact } from "./database/models/contact";
import { Manufacturer } from "./database/models/manufacturer";
import { Product } from "./database/models/product";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(express.json());

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

        // const ma = await products.map(product => {
        //     try {
        //         // const manufacturer = Manufacturer.findById(product?.manufacturer);
        //         // const contact = await Contact.findById(manufacturer?.contact);            
        //         // return await { product: product, manufacturer: manufacturer, contact: contact };

        //         const manufacturer = Manufacturer.findById(product?.manufacturer)
        //         .then((manufacturer) => {
        //             return { test: manufacturer };
        //         })
                

        //         // return { test: manufacturer };
        //     } catch (error) {
        //         throw error;
        //     }
        // });
        // console.log(ma);

        // const a: any[] = [];
        // await products.forEach(async product => {
        //     const manufacturer = await Manufacturer.findById(product?.manufacturer);
        //     const contact = await Contact.findById(manufacturer?.contact);

        //     console.log("yo");
        //     console.log({ product: product, manufacturer: manufacturer, contact: contact });
        //     console.log("yo2");
            
        //     a.push({ product: product, manufacturer: manufacturer, contact: contact });
        // });
        
        // console.log(a);
        // console.log("yo3");
        
        

        response.status(200).send(await Promise.all(products.map(async product => {
            const manufacturer = await Manufacturer.findById(product?.manufacturer);
            const contact = await Contact.findById(manufacturer?.contact);
            return { product: product, manufacturer: manufacturer, contact: contact };
        })));
        // response.status(200).send(products);

        // response.status(200).send(await products.map(async product => {
        //     const manufacturer = await Manufacturer.findById(product?.manufacturer);
        //     const contact = await Contact.findById(manufacturer?.contact);            
        //     return { product: product, manufacturer: manufacturer, contact: contact };
        // }));
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
