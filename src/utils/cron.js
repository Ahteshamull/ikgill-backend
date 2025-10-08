import cron from "node-cron";
import Case from "../models/case/caseModal.js";

// Runs daily at 02:00 Asia/Dhaka time
cron.schedule("0 2 * * *", async () => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const result = await Case.updateMany(
      {
        status: "Completed",
        isArchived: false,
        updatedAt: { $lte: tenDaysAgo },
      },
      {
        $set: {
          status: "Archived",
          isArchived: true,
          archiveDate: new Date(),
        },
      }
    );

    console.log(`Cron: Archived ${result.modifiedCount} cases`);
  } catch (err) {
    console.error("Cron: Error auto-archiving cases:", err);
  }
}, { timezone: "Asia/Dhaka" });
