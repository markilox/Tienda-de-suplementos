const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");

router.get("/", auth, getCart);
router.post("/add", auth, addToCart);
router.put("/update", auth, updateQuantity);
router.delete("/remove/:productId", auth, removeFromCart);
router.delete("/clear", auth, clearCart);

module.exports = router;
