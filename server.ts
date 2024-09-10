import dotenv from "dotenv"
import express, { Request, Response } from "express"

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.get("/", (request: Request, response: Response) => {
    response.status(200).send();
});

app.listen(PORT, () => {
    console.log(`Sever listening on http://localhost:${PORT}/`);
})