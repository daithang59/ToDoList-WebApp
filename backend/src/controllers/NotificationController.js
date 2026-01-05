import BaseController from "./BaseController.js";
import NotificationService from "../services/NotificationService.js";

/**
 * NotificationController - manage push subscriptions
 */
class NotificationController extends BaseController {
  static subscribe = BaseController.asyncHandler(async (req, res) => {
    const { ownerId, subscription } = req.body;
    const record = await NotificationService.subscribe(ownerId, subscription);
    res.status(201).json(record);
  });

  static unsubscribe = BaseController.asyncHandler(async (req, res) => {
    const { ownerId, endpoint } = req.body;
    await NotificationService.unsubscribe(ownerId, endpoint);
    res.json({ message: "Unsubscribed" });
  });
}

export default NotificationController;
