import { Router } from "express";
import AuthController from "../controllers/AuthController.js";

const router = Router();

router.post("/guest", AuthController.issueGuestToken);

export default router;
