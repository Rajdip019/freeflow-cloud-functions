import { IEmail, IEmailSchedule } from "../../interfaces/IEmail";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

export const sendEmail = async (data : IEmail) => {
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "api-key":
          "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",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    logger.error("Error sending email", e);
  }
};

export const scheduleEmail = async (data : IEmailSchedule) => {
  try {
    await fetch("https://api.brevo.com/v3/smtp/schedule", {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "api-key":
          "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",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    logger.error("Error scheduling email", e);
  }
};

export const sendEmailAndUpdateDB = async (
  user: admin.auth.UserRecord,
  dbParam: string
) => {
  const db = admin.firestore();
  // send email to the users who have uploaded but not signed in for more than 30 days
  await sendEmail({
    to: [
      {
        email: user.email as string,
        name: user.displayName as string,
      },
    ],
    templateID: 1,
  });
  // add a new object to the firestore that reminder has been sent
  const dbRef = db.collection("users").doc(user.uid);
  if (dbParam == "last_inactive_reminder_email_sent") {
    await dbRef.update({
      last_inactive_reminder_email_sent: Date.now(),
    });
  }
  return logger.info(`Sent email to ${user.email}`);
};
