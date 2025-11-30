const Product = require("../models/productModel");

const xss = require("xss");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo productos" });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const cleanData = {
      name: xss(req.body.name),
      description: xss(req.body.description),
      category: xss(req.body.category),
      price: req.body.price,
      stock: req.body.stock,
      image: xss(req.body.image)
    };

    const product = await Product.create(cleanData);

    res.status(201).json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creando producto" });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(404).json({ message: "Producto no encontrado" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Error actualizando producto" });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    res.status(400).json({ message: "Error eliminando producto" });
  }
};
