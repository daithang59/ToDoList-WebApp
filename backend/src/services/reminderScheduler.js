import cron from "node-cron";
import Todo from "../models/Todo.js";
import NotificationService from "./NotificationService.js";

const DEFAULT_CRON = "*/1 * * * *";
const DEFAULT_WINDOW_MS = 60000;

const buildReminderEmail = (todo) => {
  const deadlineText = todo.deadline
    ? new Date(todo.deadline).toLocaleString()
    : "No deadline";
  const subject = `Reminder: ${todo.title}`;
  const text = `Task "${todo.title}" is due at ${deadlineText}.`;
  const html = `<p>Task "<strong>${todo.title}</strong>" is due at <strong>${deadlineText}</strong>.</p>`;
  return { subject, text, html };
};

export function startReminderScheduler() {
  const enabled = process.env.REMINDER_ENABLED !== "false";
  if (!enabled) {
    console.log("Reminder scheduler disabled.");
    return;
  }

  const cronExpr = process.env.REMINDER_CRON || DEFAULT_CRON;
  const windowMs = parseInt(process.env.REMINDER_WINDOW_MS || DEFAULT_WINDOW_MS, 10);

  cron.schedule(cronExpr, async () => {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - windowMs);
      const windowEnd = new Date(now.getTime() + windowMs);

      const todos = await Todo.find({
        "reminder.enabled": true,
        deadline: { $ne: null },
        completed: false,
      });

      for (const todo of todos) {
        try {
          const reminder = todo.reminder || {};
          const minutesBefore = Math.max(
            1,
            parseInt(reminder.minutesBefore || 60, 10)
          );
          const reminderAt = new Date(
            new Date(todo.deadline).getTime() - minutesBefore * 60000
          );

          if (reminderAt < windowStart || reminderAt > windowEnd) {
            continue;
          }

          if (reminder.lastNotifiedAt && reminder.lastNotifiedAt >= reminderAt) {
            continue;
          }

          const channels =
            Array.isArray(reminder.channels) && reminder.channels.length
              ? reminder.channels
              : ["email"];

          let sent = false;

          if (channels.includes("email")) {
            const toEmail = reminder.email || process.env.REMINDER_DEFAULT_EMAIL || "";
            if (toEmail) {
              const { subject, text, html } = buildReminderEmail(todo);
              const emailSent = await NotificationService.sendEmail(
                toEmail,
                subject,
                text,
                html
              );
              sent = sent || emailSent;
            }
          }

          if (channels.includes("push") && todo.ownerId) {
            const pushSent = await NotificationService.sendPush(todo.ownerId, {
              title: "Todo Reminder",
              body: todo.title,
              deadline: todo.deadline,
              todoId: todo._id,
            });
            sent = sent || pushSent;
          }

          if (sent) {
            await Todo.findByIdAndUpdate(todo._id, {
              "reminder.lastNotifiedAt": now,
            });
          }
        } catch (todoError) {
          console.error(
            "Reminder processing failed:",
            todoError?.message || todoError
          );
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error?.message || error);
    }
  });
}
