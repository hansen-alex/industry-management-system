import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { Types } from "mongoose";
import { Contact } from "../models/contact";
import { Manufacturer } from "../models/manufacturer";
import { Product } from "../models/product";

const ContactType = new GraphQLObjectType({
    name: "Contact",
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
});

const ManufacturerType = new GraphQLObjectType({
    name: "Manufacturer",
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        country: { type: GraphQLString },
        website: { type: GraphQLString },
        description: { type: GraphQLString },
        address: { type: GraphQLString },
        contact: { type: GraphQLID }
    })
});

const ProductManufacturerContactType = new GraphQLObjectType({
    name: "ProductManufacturerContactType",
    fields: () => ({
        product: { type: ProductType },
        manufacturer: { type: ManufacturerType },
        contact: { type: ContactType },
    })
});

const ProductType = new GraphQLObjectType({
    name: "Product",
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        sku: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        category: { type: GraphQLString },
        amountInStock: { type: GraphQLInt },
        manufacturer: { type: GraphQLID }
    })
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        products: { //Retrieve a list of all products.
            type: new GraphQLList(ProductManufacturerContactType),
            async resolve() {
                const products = await Product.find();

                return await Promise.all(products.map(async product => {
                    const manufacturer = await Manufacturer.findById(product?.manufacturer);
                    const contact = await Contact.findById(manufacturer?.contact);
                    return { product: product, manufacturer: manufacturer, contact: contact };
                }));
            }
        },
        product: { //Retrieve details of a single product by ID.
            type: ProductManufacturerContactType,
            args: { _id: { type: GraphQLID } },
            async resolve(parent, args) {
                const product = await Product.findById(args._id);
                const manufacturer = await Manufacturer.findById(product?.manufacturer);
                const contact = await Contact.findById(manufacturer?.contact);
        
                return { product: product, manufacturer: manufacturer, contact: contact };
            }
        },
        totalStockValue: { //Retrieve the total value of all products in stock.
            type: GraphQLFloat,
            async resolve() {
                const products = await Product.find();
                return products.reduce((accumulator, currentValue) => accumulator + currentValue.price * currentValue.amountInStock, 0);
            }
        },
        totalStockValueByManufacturer: { //Retrieve the total value of products in stock, grouped by manufacturer.
            type: new GraphQLList(new GraphQLObjectType({
                name: "ManufacturerTotalStockValueType",
                fields: () => ({
                    manufacturer: { type: ManufacturerType },
                    manufacturerTotalStockValue: { type: GraphQLFloat }
                })
            })),
            async resolve() {
                const products = await Product.find();

                const valueMap = new Map();
                products.forEach(product => {
                    const manufacturerId = product.manufacturer.toString();
                    if(valueMap.has(manufacturerId))
                        valueMap.set(manufacturerId, valueMap.get(manufacturerId) + product.price * product.amountInStock);
                    else
                        valueMap.set(manufacturerId, product.price * product.amountInStock);
                });
        
                return (await Promise.all(Array.from(valueMap).map(async item => {
                    const manufacturer = await Manufacturer.findById(item[0]);
                    return { manufacturer: manufacturer, manufacturerTotalStockValue: item[1] };
                })));
            }
        },
        lowStockProducts: { //Retrieve a list of products with less than 10 units in stock.
            type: new GraphQLList(ProductType),
            resolve() {
                return Product.find({ amountInStock: { $lt: 10 } });
            }
        },
        criticalStockProducts: { //Retrieve a compact list of products with less than 5 units in stock, including the manufacturer’s name, contact name, phone, and email.
            type: new GraphQLList(new GraphQLObjectType({
                name: "CriticalStockProductType",
                fields: () => ({
                    product: { type: ProductType },
                    manufacturer: { type: GraphQLString },
                    contactName: { type: GraphQLString },
                    contactPhone: { type: GraphQLString },
                    contactEmail: { type: GraphQLString }
                })
            })),
            async resolve() {
                const criticalStockProducts = await Product.find({ amountInStock: { $lt: 5 } });
                return (await Promise.all(criticalStockProducts.map(async product => {
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
            }
        },
        manufacturers: { //Retrieve a list of all manufacturers the company is doing business with.
            type: new GraphQLList(ManufacturerType),
            resolve() {
                return Manufacturer.find();
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addProduct: { //Create a new product.
            type: ProductType,
            args: {
                name: { type: GraphQLString },
                sku: { type: GraphQLString },
                description: { type: GraphQLString },
                price: { type: GraphQLFloat },
                category: { type: GraphQLString },
                amountInStock: { type: GraphQLInt },
                manufacturer: { type: GraphQLID }
            },
            resolve(parent, args) {
                const product = new Product({
                    _id: new Types.ObjectId(),
                    name: args.name,
                    sku: args.sku,
                    description: args.description,
                    price: args.price,
                    category: args.category,
                    amountInStock: args.amountInStock,
                    manufacturer: args.manufacturer,
                });

                return product.save();
            }
        },
        updateProduct: { //Update an existing product by ID.
            type: ProductType,
            args: {
                _id: { type: GraphQLID },
                name: { type: GraphQLString },
                sku: { type: GraphQLString },
                description: { type: GraphQLString },
                price: { type: GraphQLFloat },
                category: { type: GraphQLString },
                amountInStock: { type: GraphQLInt },
                manufacturer: { type: GraphQLID }
            },
            async resolve(parent, args) {
                const updateProduct = await Product.findByIdAndUpdate(
                    args._id,
                    {
                        $set: {
                            name: args.name,
                            sku: args.sku,
                            description: args.description,
                            price: args.price,
                            category: args.category,
                            amountInStock: args.amountInStock,
                            manufacturer: args.manufacturer
                        }
                    },
                    { new: true }
                );

                return updateProduct;
            }
        },
        deleteProduct: { //Delete a product by ID.
            type: ProductType,
            args: {
                _id: { type: GraphQLID }
            },
            async resolve(parent, args) {
                return await Product.findByIdAndDelete(args._id);
            }
        }
    }
});

export const Schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});