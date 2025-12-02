const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.product");
    res.json(cart || { userId: req.user.id, items: [] });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo carrito" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [{ product: productId, quantity }]
      });
    } else {
      const item = cart.items.find(i => i.product.toString() === productId);

      if (item) {
        item.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error añadiendo producto al carrito" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Carrito vacío" });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Producto no está en el carrito" });

    item.quantity = quantity;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando cantidad" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Carrito vacío" });

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error eliminando producto del carrito" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ message: "Error vaciando carrito" });
  }
};
