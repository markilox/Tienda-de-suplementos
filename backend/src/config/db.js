const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error: ", error);
    process.exit(1);
  }
};

module.exports = connectDB;