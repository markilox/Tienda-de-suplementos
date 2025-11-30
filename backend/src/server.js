const express = require('express');
const cors = require('cors');

require('dotenv').config();

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const helmet = require("helmet");
connectDB();


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

app.use(express.static("public"));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
