const Product = require("../models/productModel");
const Order = require("../models/checkoutModel"); // tu modelo de pedidos

exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id; // viene del middleware auth
    const cart = req.body.cart; // [{id, quantity}]

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "No hay productos en el carrito" });
    }

    let total = 0;
    let validatedItems = [];
    let insufficientStock = [];

    // Validar stock de cada producto
    for (const item of cart) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.id}` });
      }

      if (product.stock < item.quantity) {
        insufficientStock.push({
          id: product._id,
          name: product.name,
          available: product.stock,
          requested: item.quantity
        });
      }

      validatedItems.push({ product, quantity: item.quantity });
      total += product.price * item.quantity;
    }

    // Si hay productos con stock insuficiente, devolvemos error
    if (insufficientStock.length > 0) {
      return res.status(400).json({
        message: "No hay suficiente stock para algunos productos",
        insufficientStock
      });
    }

    // Descontar stock
    for (const item of validatedItems) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    // Crear pedido en base de datos
    const order = await Order.create({
      user: userId,
      items: validatedItems.map(i => ({
        product: i.product._id,
        quantity: i.quantity
      })),
      total
    });

    res.status(201).json({
      message: "Pedido realizado con éxito",
      order
    });

  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Error procesando el pedido" });
  }
};
