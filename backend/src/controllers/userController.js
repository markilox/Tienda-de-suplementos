const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const xss = require("xss");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
};


exports.getUserById = async (req, res) => {
  try {
    // Validación básica de ID (evita NoSQL injection)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    // Buscar usuario y NO devolver contraseña
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);

  } catch (error) {
    console.error("ERROR REAL getUserById:", error);
    res.status(500).json({ message: "Error obteniendo usuario" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const cleanData = {};

    if (req.body.name) cleanData.name = xss(req.body.name);
    if (req.body.email) cleanData.email = xss(req.body.email);

    // Evitar que un usuario cambie su propio role o contraseña desde esta ruta
    delete req.body.password;
    delete req.body.role;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      cleanData,
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: "Error actualizando usuario" });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(400).json({ message: "Error eliminando usuario" });
  }
};



// Se realiza el registro

exports.register = async (req, res) => {
  try {
    const name = xss(req.body.name);
    const email = xss(req.body.email);
    const password = req.body.password; // NO sanitizar la contraseña

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Usuario registrado", user });

  } catch (error) {
    res.status(500).json({ message: "Error registrando usuario" });
  }
};



// Se hace login

exports.login = async (req, res) => {
  console.log(" Datos recibidos en /login:", req.body) 
  try {
    const email = xss(req.body.email);
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login exitoso", token });

  } catch (error) {
    res.status(500).json({ message: "Error durante el login" });
  }
};



// Se obtiene perfil del usuario (requiere token)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo perfil" });
  }
};

