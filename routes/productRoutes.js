const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Ajouter un produit
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Produit créé avec succès",
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du produit",
      error: error.message
    });
  }
});
// Récupérer tous les produits
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des produits",
      error: error.message
    });
  }
});
// Récupérer un produit par son ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé"
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du produit",
      error: error.message
    });
  }
});
// Modifier un produit
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé"
      });
    }

    res.status(200).json({
      message: "Produit modifié avec succès",
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la modification du produit",
      error: error.message
    });
  }
});
// Supprimer un produit
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé"
      });
    }

    res.status(200).json({
      message: "Produit supprimé avec succès",
      product
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du produit",
      error: error.message
    });
  }
});

module.exports = router;