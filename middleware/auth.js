const jwt = require("jsonwebtoken");
require("dotenv").config();

// Simulating a token blacklist (use Redis/DB in production)
const tokenBlacklist = new Set();

const verify = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const userAgent = req.headers["user-agent"];
    const userIp = req.ip || req.connection.remoteAddress;

    if (!header) {
      return res.status(403).json({ message: "Authorization header missing" });
    }

    const bearer = header.split(" ");
    if (bearer.length !== 2 || bearer[0] !== "Bearer") {
      return res.status(403).json({ message: "Invalid token format" });
    }

    const token = bearer[1];

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Session expired, please log in again" });
        }
        return res.status(401).json({ message: "You are not authorized" });
      }

      // Optional: Verify if IP/User-Agent matches the one in the token payload
      if (decoded.ip !== userIp || decoded.userAgent !== userAgent) {
        return res
          .status(401)
          .json({
            message: "Token mismatch detected. Possible session hijack.",
          });
      }

      req.curUserId = decoded.id; // Ensure consistency with login payload
      next();
    });
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to blacklist token (call this during logout)
const revokeToken = (token) => {
  tokenBlacklist.add(token);
};

module.exports = {
  verify,
  revokeToken,
};
