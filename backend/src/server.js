const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
connectDB();

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
