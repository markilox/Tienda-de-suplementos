const express = require('express');
const cors = require('cors');
const helmet = require("helmet");
require('dotenv').config();

const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");

connectDB();

const app = express();

app.use(helmet());
app.use(cors());

// 🔥 MUY IMPORTANTE: primero procesar formularios y JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟢 Después montar las rutas
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);

// Archivos estáticos
app.use(express.static("public"));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
