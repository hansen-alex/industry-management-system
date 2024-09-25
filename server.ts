import dotenv from "dotenv"
import express, { Request, Response } from "express"
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

mongoose.connect(process.env.DB_URI as string, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
})

app.get("/api/products", (request: Request, response: Response) => {
    try {
        response.status(200).send();
    } catch (error) {
        response.status(500).send();
    }
});

app.get("/api/products/:id", (request: Request, response: Response) => {
    try {
        response.status(200).send();
    } catch (error) {
        response.status(500).send();
    }
});

app.post("/api/products", (request: Request, response: Response) => {
    try {
        response.status(200).send();
    } catch (error) {
        response.status(500).send();
    }
});

app.put("/api/products/:id", (request: Request, response: Response) => {
    try {
        response.status(200).send();
    } catch (error) {
        response.status(500).send();
    }
});

app.delete("/api/products/:id", (request: Request, response: Response) => {
    try {
        response.status(200).send();
    } catch (error) {
        response.status(500).send();
    }
});

app.listen(PORT, () => {
    console.log(`Sever listening on http://localhost:${PORT}/`);
})
