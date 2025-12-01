const Product = require("../models/productModel");
const Order = require("../models/checkoutModel");

exports.checkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = req.body.items;  

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No hay productos en el pedido" });
    }

    let total = 0;
    let validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`
        });
      }

      total += product.price * item.quantity;

      validatedItems.push({
        product,
        quantity: item.quantity
      });
    }

    for (const item of validatedItems) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

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
