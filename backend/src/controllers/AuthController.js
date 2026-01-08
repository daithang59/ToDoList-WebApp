import jwt from "jsonwebtoken";
import BaseController from "./BaseController.js";

const normalizeClientId = (value) =>
  typeof value === "string" ? value.trim() : "";

class AuthController extends BaseController {
  static issueGuestToken = BaseController.asyncHandler(async (req, res) => {
    const clientId = normalizeClientId(req.body?.clientId);
    if (!clientId) {
      return res.status(400).json({ message: "clientId is required" });
    }
    if (clientId.length > 128) {
      return res.status(400).json({ message: "clientId is too long" });
    }

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not configured");
      error.status = 500;
      throw error;
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
    const token = jwt.sign(
      { sub: clientId, role: "member" },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.json({
      token,
      tokenType: "Bearer",
      expiresIn,
      ownerId: clientId,
    });
  });
}

export default AuthController;
