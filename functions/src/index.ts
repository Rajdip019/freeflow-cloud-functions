import { initializeApp } from "firebase-admin/app";
import * as functions from "firebase-functions";
import { getUsers } from "./packages/getAuthUsers";
import { sendEmailToInactive } from "./modules/emails/reminderEmails";
import { sendFeaturesMail } from "./modules/emails/promoEmails";

// exporting functions for deployment
export { newVersionUploaded, versionDeleted } from "./modules/storage-calculation/versions";
export { newCommentAdded, commentDeleted } from "./modules/storage-calculation/comments";
export { designDeleteCleanup, deleteReplies } from "./modules/db-cleanup/designDelete";
export { sendWelcomeEmails } from "./modules/emails/welcomeEmails"; // send welcome emails
export {
  syncDeleteEmailContactsDB, // sync delete email contacts
  syncUpdatesEmailContactsDB, // sync update email contacts
} from "./modules/emails/syncEmailContactsDB";
// send invite emails and create cleanup task
export { newInvitation } from "./modules/invite-collaborators/newInvitation";
export {
  workspaceDataUpdateConsistency, // sync workspace name and avatarUrl for users>>workspaces
  workspaceDataDeleteConsistency, // sync delete workspace for users>>workspaces
} from "./modules/database-consistency/workspaces";
export {
  collaboratesDataUpdateConsistency, // sync user name and avatarUrl for workspace>>collaborators
  collaboratesDataDeleteConsistency, // sync delete user for workspace>>collaborators
} from "./modules/database-consistency/collaborators";
export {
  collaboratesInsideWorkspaceDataDeleteConsistency, // sync delete workspaces>>collaborators for user>>workspaces
  workspaceInsideUsersDataDeleteConsistency, // sync delete user>>workspaces for workspaces>>collaborators
  roleAndStatusConsistencyUser, // sync role and status for user>>workspaces
  roleAndStatusConsistencyWorkspace, // sync role and status for workspaces>>collaborators
} from "./modules/database-consistency/invite";
// delete expired invitations
export { deleteExpiredInvitations } from "./modules/invite-collaborators/deleteExpiredInvitations";

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
