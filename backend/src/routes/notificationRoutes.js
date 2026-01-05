import { Router } from "express";
import NotificationController from "../controllers/NotificationController.js";

const router = Router();

router.post("/subscribe", NotificationController.subscribe);
router.delete("/subscribe", NotificationController.unsubscribe);

export default router;
