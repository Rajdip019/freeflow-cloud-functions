import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions";
import { getUsers } from "./packages/getAuthUsers";
import { sendEmailToInactive } from "./modules/emails/reminderEmails";
import { sendFeaturesMail } from "./modules/emails/promoEmails";

// exporting functions for deployment
export { sendWelcomeEmails } from "./modules/emails/welcomeEmails";
export { syncDeleteEmailContactsDB, syncUpdatesEmailContactsDB } from "./modules/emails/syncEmailContactsDB";
export { sendWorkspaceInviteEmail } from "./modules/emails/invitationEmails";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

initializeApp(firebaseConfig);

export const emailScheduleFunction = functions.pubsub
  .schedule("every day 08:00")
  .timeZone("Asia/Calcutta")
  .onRun(async () => {
    // Fetch all user details.
    const users = await getUsers();

    // Send email to users.
    await sendEmailToInactive(users);
    await sendFeaturesMail(users);

    functions.logger.log("Reminder emails sent to users.");
  });
