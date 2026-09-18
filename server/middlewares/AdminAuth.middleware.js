const HttpException = require("../exceptions/HttpException");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const EnsureAdmin = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.jwtsecret || "your-secret-key");
      const userId = decodedToken.userId;
      
      const user = await UserModel.findById(userId);
      if (!user || user.role !== "admin") {
        throw new HttpException(403, "Admin access required");
      }
      
      req.body.user = userId;
      next();
    } catch (error) {
      next(error instanceof HttpException ? error : new HttpException(401, "Invalid token"));
    }
  } else {
    next(new HttpException(401, "Not authorized"));
  }
};

module.exports = EnsureAdmin;
