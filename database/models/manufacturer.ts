import { Schema, model } from "mongoose"

export interface IManufacturer {
    name: string,
    country: string,
    website: string,
    description: string,
    address: string,
    contact: Schema.Types.ObjectId
}

const manufacturerSchema = new Schema<IManufacturer>({
    name: { type: String, required: true },
    country: { type: String, required: true },
    website: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: Schema.Types.ObjectId, ref: "Contact", required: true }
});

export const Manufacturer = model<IManufacturer>("Manufacturer", manufacturerSchema);
