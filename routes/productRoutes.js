
const express = require("express");
const Product = require("../models/Product");

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

/* =====================================================
   AJOUTER UN PRODUIT
   POST /api/products
===================================================== */

router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    console.log("POST /api/products reçu");
    console.log("Données reçues :", req.body);

    const {
      name,
      description,
      price,
      stock,
      category,
      image
    } = req.body;

    // Vérification des champs obligatoires
    if (
      !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Nom, description, prix, stock et catégorie sont obligatoires"
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      image
    });

    console.log("Produit créé :", product);

    res.status(201).json({
      message: "Produit créé avec succès",
      product
    });

  } catch (error) {
    console.error(
      "ERREUR CREATION PRODUIT :",
      error
    );

    res.status(500).json({
      message: "Erreur lors de la création du produit",
      error: error.message
    });
  }
});


/* =====================================================
   RÉCUPÉRER TOUS LES PRODUITS
   GET /api/products
===================================================== */

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);

  } catch (error) {
    console.error(
      "ERREUR GET PRODUITS :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération des produits",
      error: error.message
    });
  }
});


/* =====================================================
   RÉCUPÉRER UN PRODUIT
   GET /api/products/:id
===================================================== */

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Produit non trouvé"
      });
    }

    res.status(200).json(product);

  } catch (error) {
    console.error(
      "ERREUR GET PRODUIT :",
      error
    );

    res.status(500).json({
      message:
        "Erreur lors de la récupération du produit",
      error: error.message
    });
  }
});


/* =====================================================
   MODIFIER UN PRODUIT
   PUT /api/products/:id
===================================================== */

router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        stock,
        category,
        image
      } = req.body;

      if (
        !name ||
        !description ||
        price === undefined ||
        stock === undefined ||
        !category
      ) {
        return res.status(400).json({
          message:
            "Nom, description, prix, stock et catégorie sont obligatoires"
        });
      }

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            category,
            image
          },
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
        message:
          "Produit modifié avec succès",
        product
      });

    } catch (error) {
      console.error(
        "ERREUR MODIFICATION PRODUIT :",
        error
      );

      res.status(500).json({
        message:
          "Erreur lors de la modification du produit",
        error: error.message
      });
    }
  }
);


/* =====================================================
   SUPPRIMER UN PRODUIT
   DELETE /api/products/:id
===================================================== */

router.delete(
  "/:id",
  authMiddleware,
  isAdmin,
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Produit non trouvé"
        });
      }

      res.status(200).json({
        message:
          "Produit supprimé avec succès",
        product
      });

    } catch (error) {
      console.error(
        "ERREUR SUPPRESSION PRODUIT :",
        error
      );

      res.status(500).json({
        message:
          "Erreur lors de la suppression du produit",
        error: error.message
      });
    }
  }
);


module.exports = router;
