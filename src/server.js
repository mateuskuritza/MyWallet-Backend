import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.listen(4000, () => console.log("Server running..."));

export default app;
