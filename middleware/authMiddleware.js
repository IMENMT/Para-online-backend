const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    // Vérifier si le header existe
    if (!authHeader) {
      return res.status(401).json({
        message: "Accès refusé. Token manquant."
      });
    }

    // Récupérer le token
    // Format : Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token invalide."
      });
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Stocker les informations de l'utilisateur
    req.user = decoded;

    // Autoriser la suite de la requête
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré."
    });
  }
};


module.exports = authMiddleware;