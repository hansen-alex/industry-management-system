import { Types, Schema, model } from "mongoose"

export interface IProduct {
    _id: Types.ObjectId,
    name: string,
    sku: string,
    description: string,
    price: number,
    category: string,
    amountInStock: number,
    manufacturer: Schema.Types.ObjectId
}

const productSchema = new Schema<IProduct>({
    _id: Types.ObjectId,
    name: { type: String, required: true },
    sku: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    amountInStock: { type: Number, required: true },
    manufacturer: { type: Schema.Types.ObjectId, ref: "Manufacturer", required: true },
});

export const Product = model<IProduct>("Product", productSchema);
