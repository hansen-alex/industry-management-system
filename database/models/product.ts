import { Schema, model } from "mongoose"
import { IManufacturer } from "./manufacturer"

export interface IProduct {
    name: string,
    sku: string,
    description: string,
    price: number,
    category: string,
    amountInStock: number,
    manufacturer: IManufacturer
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    sku: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    amountInStock: { type: Number, required: true },
    manufacturer: { type: Schema.Types.ObjectId, ref: "Manufacturer", required: true },
});

export const Product = model<IProduct>("Product", productSchema);
