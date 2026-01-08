import jwt from "jsonwebtoken";

const getTokenFromHeader = (req) => {
  const header = req.headers?.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer") return null;
  return token || null;
};

export function authMiddleware(req, res, next) {
  if (req.method === "OPTIONS") return next();
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ message: "Missing authentication token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const memberId = typeof payload?.sub === "string" ? payload.sub.trim() : "";
    if (!memberId) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    req.user = { id: memberId, role: payload.role || "member" };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
