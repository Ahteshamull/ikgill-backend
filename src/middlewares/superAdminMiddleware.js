import jwt from "jsonwebtoken";

const superAdminMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      let decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.PRV_TOKEN);
      let { role } = decoded;
      if (role === "superadmin") {
        next();
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Only Super Admin Can Perform This Action" });
      }
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized, JWT token is wrong or expired",
      });
    }
  } else {
    return res.status(403).send({ success: false, message: "Token Not Found" });
  }
};

export default superAdminMiddleware;
