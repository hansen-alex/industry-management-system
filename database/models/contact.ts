import { Schema, model } from "mongoose"

export interface IContact {
    name: string,
    email: string,
    phone: string
}

const contactSchema = new Schema<IContact>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
});

export const Contact = model<IContact>("Contact", contactSchema);
