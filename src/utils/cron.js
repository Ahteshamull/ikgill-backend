import cron from "node-cron";
import Case from "../models/case/caseModal.js";

// Runs daily at 02:00 Asia/Dhaka time
cron.schedule("0 2 * * *", async () => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

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

    console.log(`Cron: Archived ${result.modifiedCount} completed cases (10+ days old)`);

    const resultApproved = await Case.updateMany(
      {
        status: "Accepted",
        isArchived: false,
        "adminApproval.status": "Accepted",
        "adminApproval.approvedAt": { $lte: fourteenDaysAgo },
      },
      {
        $set: {
          status: "Archived",
          isArchived: true,
          archiveDate: new Date(),
        },
      }
    );

    console.log(
      `Cron: Archived ${resultApproved.modifiedCount} admin-approved cases (14+ days since approval)`
    );
  } catch (err) {
    console.error("Cron: Error auto-archiving cases:", err);
  }
}, { timezone: "Asia/Dhaka" });
