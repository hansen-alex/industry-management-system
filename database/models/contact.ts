import { Types, Schema, model } from "mongoose"

export interface IContact {
    _id: Types.ObjectId,
    name: string,
    email: string,
    phone: string
}

const contactSchema = new Schema<IContact>({
    _id: Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
});

export const Contact = model<IContact>("Contact", contactSchema);
