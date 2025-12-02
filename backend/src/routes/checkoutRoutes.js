const express = require("express");
const router = express.Router();

const { checkout } = require("../controllers/checkoutController");
const auth = require("../middlewares/authMiddleware"); // requiere login

router.post("/", auth, checkout);

module.exports = router;
