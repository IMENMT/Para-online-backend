const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
// ==========================================
// REGISTER - Créer un nouveau compte
// ==========================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier les champs obligatoires
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires"
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé"
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Retourner les informations sans le mot de passe
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'inscription",
      error: error.message
    });
  }
});


// ==========================================
// LOGIN - Connexion d'un utilisateur
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier les champs
    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe sont obligatoires"
      });
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    // Vérifier le mot de passe
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    // Réponse
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la connexion",
      error: error.message
    });
  }
});


router.get("/profile", authMiddleware, async (req, res) => {
  res.status(200).json({
    message: "Accès autorisé",
    user: req.user
  });
});
// Exporter les routes
module.exports = router;