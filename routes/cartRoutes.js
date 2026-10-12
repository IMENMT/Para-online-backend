const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// AJOUTER UN PRODUIT AU PANIER
// ==========================================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Vérifier les données
    if (!productId || !quantity) {
      return res.status(400).json({
        message: "productId et quantity sont obligatoires"
      });
    }

    // Vérifier que le produit existe
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé"
      });
    }

    // Chercher le panier de l'utilisateur
    let cart = await Cart.findOne({
      user: req.user.id
    });

    // Si le panier n'existe pas, le créer
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [
          {
            product: productId,
            quantity: quantity
          }
        ]
      });

      return res.status(201).json({
        message: "Produit ajouté au panier",
        cart
      });
    }

    // Vérifier si le produit existe déjà dans le panier
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity
      });
    }

    await cart.save();

    res.status(200).json({
      message: "Produit ajouté au panier",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout au panier",
      error: error.message
    });
  }
});
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id
    }).populate("items.product");

    if (!cart) {
      return res.status(404).json({
        message: "Panier vide"
      });
    }

    res.status(200).json(cart);

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du panier",
      error: error.message
    });
  }
});
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        message: "productId et quantity sont obligatoires"
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: "La quantité doit être au minimum 1"
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Panier non trouvé"
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Produit non trouvé dans le panier"
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json({
      message: "Quantité modifiée avec succès",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la modification de la quantité",
      error: error.message
    });
  }
});
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Panier non trouvé"
      });
    }

    const productId = req.params.productId;

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        message: "Produit non trouvé dans le panier"
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.status(200).json({
      message: "Produit supprimé du panier",
      cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression",
      error: error.message
    });
  }
});
module.exports = router;