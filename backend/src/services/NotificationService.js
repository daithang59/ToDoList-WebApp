import nodemailer from "nodemailer";
import webpush from "web-push";
import NotificationSubscription from "../models/NotificationSubscription.js";

const hasEmailConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );

const getEmailTransport = (() => {
  let transport = null;
  return () => {
    if (!hasEmailConfig()) return null;
    if (!transport) {
      transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return transport;
  };
})();

const hasPushConfig = () =>
  Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );

const initWebPush = (() => {
  let initialized = false;
  return () => {
    if (initialized || !hasPushConfig()) return;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    initialized = true;
  };
})();

class NotificationService {
  static async subscribe(ownerId, subscription) {
    if (!ownerId) {
      throw new Error("OwnerId is required");
    }
    if (!subscription?.endpoint) {
      throw new Error("Subscription endpoint is required");
    }

    const existing = await NotificationSubscription.findOne({
      ownerId,
      "subscription.endpoint": subscription.endpoint,
    });

    if (existing) return existing;

    return NotificationSubscription.create({ ownerId, subscription });
  }

  static async unsubscribe(ownerId, endpoint) {
    if (!ownerId || !endpoint) {
      throw new Error("OwnerId and endpoint are required");
    }
    await NotificationSubscription.deleteMany({
      ownerId,
      "subscription.endpoint": endpoint,
    });
    return true;
  }

  static async getSubscriptions(ownerId) {
    if (!ownerId) return [];
    return NotificationSubscription.find({ ownerId });
  }

  static async sendEmail(to, subject, text, html) {
    const transport = getEmailTransport();
    if (!transport) return false;

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transport.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    return true;
  }

  static async sendPush(ownerId, payload) {
    if (!hasPushConfig()) return false;
    initWebPush();

    const subscriptions = await this.getSubscriptions(ownerId);
    if (!subscriptions.length) return false;

    const payloadString = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subscriptions.map((entry) => webpush.sendNotification(entry.subscription, payloadString))
    );

    const failedEndpoints = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const endpoint = subscriptions[index].subscription?.endpoint;
        if (endpoint) {
          failedEndpoints.push(endpoint);
        }
      }
    });

    if (failedEndpoints.length > 0) {
      await NotificationSubscription.deleteMany({
        ownerId,
        "subscription.endpoint": { $in: failedEndpoints },
      });
    }

    return results.some((result) => result.status === "fulfilled");
  }
}

export default NotificationService;
