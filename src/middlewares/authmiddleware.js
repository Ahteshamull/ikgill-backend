import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let { token } = req.cookies;

  if (token) {
    try {
      let decoded = jwt.verify(token, process.env.PRV_TOKEN);
      let { role } = decoded.loginUserInfo;
      if (role === "admin") {
        next();
      } else {
        return res
          .status(403)
          .send({ success: false, message: "Only Admin Can See It" });
      }
    } catch (err) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized ,JWT token is wrong or expired",
      });
    }
  } else {
    return res.status(403).send({ success: false, message: "Token Not Found" });
  }
};

export default authMiddleware;
