import jwt from "jsonwebtoken";

// Middleware to authenticate JWT and attach the user to req.user
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("You must be logged in to log out.");
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send("Invalid or expired token");
    }

    req.user = user;
    next();
  });
};

export default authenticateJWT;
