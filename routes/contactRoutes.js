
const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");

console.log("🔥 CONTACT ROUTES CHARGÉ");

// =====================================================
// POST - Envoyer un message
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      isRead: false,
    });

    await contact.save();

    res.status(201).json({
      message:
        "Votre message a été envoyé avec succès !",
      contact,
    });
  } catch (error) {
    console.error(
      "❌ Erreur création contact :",
      error
    );

    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

// =====================================================
// GET - Récupérer tous les messages
// =====================================================

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    res.status(200).json(contacts);
  } catch (error) {
    console.error(
      "❌ Erreur récupération messages :",
      error
    );

    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

// =====================================================
// PUT - Marquer comme LU
// =====================================================

router.put("/:id/read", async (req, res) => {
  console.log(
    "➡️ Route READ appelée :",
    req.params.id
  );

  try {
    const contact =
      await Contact.findByIdAndUpdate(
        req.params.id,
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    if (!contact) {
      return res.status(404).json({
        message: "Message introuvable",
      });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error(
      "❌ Erreur marquage lu :",
      error
    );

    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

// =====================================================
// PUT - Marquer comme NON LU
// =====================================================

router.put("/:id/unread", async (req, res) => {
  console.log(
    "➡️ Route UNREAD appelée :",
    req.params.id
  );

  try {
    const contact =
      await Contact.findByIdAndUpdate(
        req.params.id,
        {
          isRead: false,
        },
        {
          new: true,
        }
      );

    if (!contact) {
      return res.status(404).json({
        message: "Message introuvable",
      });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error(
      "❌ Erreur marquage non lu :",
      error
    );

    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE - Supprimer un message
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const contact =
      await Contact.findByIdAndDelete(
        req.params.id
      );

    if (!contact) {
      return res.status(404).json({
        message: "Message introuvable",
      });
    }

    res.status(200).json({
      message: "Message supprimé avec succès",
    });
  } catch (error) {
    console.error(
      "❌ Erreur suppression message :",
      error
    );

    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
});

module.exports = router;
