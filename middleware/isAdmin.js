const isAdmin = (req, res, next) => {
  // Vérifier si l'utilisateur est connecté
  if (!req.user) {
    return res.status(401).json({
      message: "Authentification requise"
    });
  }

  // Vérifier si l'utilisateur est administrateur
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Accès réservé à l'administrateur"
    });
  }

  // Autoriser l'accès
  next();
};

module.exports = isAdmin;