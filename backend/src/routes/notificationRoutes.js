import { Router } from "express";
import NotificationController from "../controllers/NotificationController.js";
import NotificationValidation from "../middlewares/notificationValidation.js";

const router = Router();

router.post(
  "/subscribe",
  NotificationValidation.validateSubscribe,
  NotificationController.subscribe
);
router.delete(
  "/subscribe",
  NotificationValidation.validateUnsubscribe,
  NotificationController.unsubscribe
);

export default router;
