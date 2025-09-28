import schedule from "node-schedule";
import { createNotification } from "../services/Notification.service.js";
import Outfit from "../models/Outfit.js";

// Helper: convert "hh:mm AM/PM" to 24-hour hours and minutes
const parseAmPm = (timeStr) => {
  const [time, ampm] = timeStr.split(" ");
  let [hour, minute] = time.split(":").map(Number);
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return { hour, minute };
};

export const schedulePlannerNotification = (planner) => {
  const { hour, minute } = parseAmPm(planner.time);

  // Combine date and time into a single Date object
  const notificationDate = new Date(planner.date);
  notificationDate.setHours(hour, minute, 0, 0);

  // Only schedule if the notification time is in the future
  if (notificationDate > new Date()) {
    schedule.scheduleJob(notificationDate, async () => {
      try {
        // Create notification for the user
        await createNotification({
          userId: planner.user,
          plannerId: planner._id,
        });

        // Increment outfit usage counter
        const outfit = await Outfit.findById(planner.outfit);
        if (outfit) {
          outfit.usage = (outfit.usage || 0) + 1;
          await outfit.save();
        }

        // Optional: delete planner after notification
        // await planner.remove();
      } catch (err) {
        console.error("Error in scheduled notification:", err);
      }
    });
  } else {
    console.log(
      "Planner time is in the past, not scheduling:",
      notificationDate
    );
  }
};
