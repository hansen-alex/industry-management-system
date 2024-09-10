import dotenv from "dotenv"
import express, { Request, Response } from "express"
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

mongoose.connect("mongodb+srv://fjs23.fe21v.mongodb.net/industry_management_system", {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
})

app.get("/", (request: Request, response: Response) => {
    response.status(200).send();
});

app.listen(PORT, () => {
    console.log(`Sever listening on http://localhost:${PORT}/`);
})
