import BaseController from "./BaseController.js";
import NotificationService from "../services/NotificationService.js";

/**
 * NotificationController - manage push subscriptions
 */
class NotificationController extends BaseController {
  static subscribe = BaseController.asyncHandler(async (req, res) => {
    const ownerId = req.user?.id;
    const { subscription } = req.body;
    const record = await NotificationService.subscribe(ownerId, subscription);
    res.status(201).json(record);
  });

  static unsubscribe = BaseController.asyncHandler(async (req, res) => {
    const ownerId = req.user?.id;
    const endpoint = req.body?.endpoint || req.query?.endpoint;
    await NotificationService.unsubscribe(ownerId, endpoint);
    res.json({ message: "Unsubscribed" });
  });
}

export default NotificationController;
