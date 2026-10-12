
const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// ==========================================
// CRÉER UNE COMMANDE
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { customerInfo } = req.body;

    // Vérifier les coordonnées du client
    if (
      !customerInfo ||
      !customerInfo.name ||
      !customerInfo.phone ||
      !customerInfo.address ||
      !customerInfo.city ||
      !customerInfo.postalCode
    ) {
      return res.status(400).json({
        message: "Veuillez remplir toutes les coordonnées de livraison"
      });
    }

    // Récupérer le panier
    const cart = await Cart.findOne({
      user: req.user.id
    }).populate("items.product");

    if (!cart) {
      return res.status(404).json({
        message: "Panier non trouvé"
      });
    }

    // Vérifier si le panier est vide
    if (cart.items.length === 0) {
      return res.status(400).json({
        message: "Le panier est vide"
      });
    }

    // Vérifier que les produits existent
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(404).json({
          message: "Un produit du panier n'existe plus"
        });
      }
    }

    // Vérifier le stock
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Stock insuffisant pour le produit : ${item.product.name}`,
          stockDisponible: item.product.stock,
          quantiteDemandee: item.quantity
        });
      }
    }

    // Préparer les produits de la commande
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    // Calculer le total
    const totalPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Créer la commande
    const order = await Order.create({
      user: req.user.id,

      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        postalCode: customerInfo.postalCode
      },

      items: orderItems,
      totalPrice: totalPrice
    });

    // Diminuer le stock
    for (const item of cart.items) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    // Vider le panier
    cart.items = [];
    await cart.save();

    // Réponse
    res.status(201).json({
      message: "Commande créée avec succès",
      order
    });

  } catch (error) {
    console.error("Erreur commande :", error);

    res.status(500).json({
      message: "Erreur lors de la création de la commande",
      error: error.message
    });
  }
});

// ==========================================
// RÉCUPÉRER LES COMMANDES DU CLIENT
// ==========================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    console.error("Erreur récupération commandes :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
      error: error.message
    });
  }
});

// ==========================================
// RÉCUPÉRER TOUTES LES COMMANDES - ADMIN
// ==========================================
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    console.error("Erreur récupération commandes admin :", error);

    res.status(500).json({
      message: "Erreur lors de la récupération des commandes",
      error: error.message
    });
  }
});

// ==========================================
// MODIFIER LE STATUT - ADMIN
// ==========================================
router.put("/:id/status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Statut invalide"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Commande non trouvée"
      });
    }

    res.status(200).json({
      message: "Statut de la commande modifié avec succès",
      order
    });

  } catch (error) {
    console.error("Erreur modification statut :", error);

    res.status(500).json({
      message: "Erreur lors de la modification du statut",
      error: error.message
    });
  }
});
// ==========================================
// SUPPRIMER UNE COMMANDE - ADMIN
// ==========================================
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Commande non trouvée"
      });
    }

    res.status(200).json({
      message: "Commande supprimée avec succès"
    });

  } catch (error) {
    console.error("Erreur suppression commande :", error);

    res.status(500).json({
      message: "Erreur lors de la suppression de la commande",
      error: error.message
    });
  }
});

// ==========================================
// EXPORTER LE ROUTER
// ==========================================
module.exports = router;
