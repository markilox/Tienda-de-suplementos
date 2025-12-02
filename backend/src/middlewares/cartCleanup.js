const Cart = require("../models/cartModel");

exports.cleanOldCarts = async (req, res, next) => {
  try {
    if (Math.random() < 0.02) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const deleted = await Cart.deleteMany({
        updatedAt: { $lt: oneDayAgo }
      });
      
      if (deleted.deletedCount > 0) {
        console.log(`Limpieza automática: ${deleted.deletedCount} carritos antiguos borrados`);
      }
    }
    next();
  } catch (error) {
    console.error("Error en limpieza de carritos:", error);
    next();
  }
};