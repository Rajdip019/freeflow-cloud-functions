import * as logger from "firebase-functions/logger";
import { sendEmail, sendEmailAndUpdateDB } from "../../packages/sendEmail";
import * as admin from "firebase-admin";

// sends reminder email to inactive users who have not signed in for more than 30 days
export const sendEmailToInactive = async (users: admin.auth.UserRecord[]) => {
  try {
    const db = admin.firestore();
    const inactiveUsers = users.filter(
      (user) =>
        Date.parse(user.metadata.lastSignInTime) <
        Date.now() - 30 * 24 * 60 * 60 * 1000
    );
    logger.info(`Found ${inactiveUsers.length} inactive users`);
    if (inactiveUsers.length > 0) {
      // if we have inactive users
      inactiveUsers.map(async (user) => {
        const userMetadataRef = db.collection("users-metadata").doc(user.uid);
        const userMetadataSnapshot = await userMetadataRef.get();
        // check if the reminder email has been sent in last 30 days
        if (
          userMetadataSnapshot.exists &&
          userMetadataSnapshot.data()?.last_inactive_reminder_email_sent
        ) {
          logger.info("User metadata exists for last inactive reminder email");
          if (
            userMetadataSnapshot.data()?.last_inactive_reminder_email_sent >
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ) {
            return logger.info(
              `Reminder email already sent to ${user.email} in last 30 days`
            ); // not sending email if reminder email has been sent in last 30 days
          } else {
            // send email to the users who have uploaded but not signed in for more than 30 days
            await sendEmailAndUpdateDB(
              user,
              "last_inactive_reminder_email_sent"
            );
            return logger.info(`Sent inactive reminder email to ${user.email}`);
            // add a new object to the firestore that reminder has been sent
          }
        } else {
          // send email to the users who have uploaded but not signed in for more than 30 days
          await sendEmailAndUpdateDB(user, "last_inactive_reminder_email_sent");
          return logger.info(`Sent inactive reminder email to ${user.email}`);
          // add a new object to the firestore that reminder has been sent
        }
      });
      return logger.info(
        `Reminder emails sent to ${inactiveUsers.length} inactive users.`
      );
    } else {
      return logger.info("No inactive users found to send reminder");
    }
  } catch (e) {
    logger.error("Error sending email", e);
  }
};

export const sendNewUserNoDesignUploadReminder = async (
  users: admin.auth.UserRecord[]
) => {
  // Filters that the user is more than 4 days but less than 5 days old
  const newUsersWithNoDesign = users.filter(
    (user) =>
      Date.parse(user.metadata.creationTime) <
        Date.now() - 4 * 24 * 60 * 60 * 1000 &&
      Date.parse(user.metadata.creationTime) >
        Date.now() - 5 * 24 * 60 * 60 * 1000
  );
  if (newUsersWithNoDesign.length > 0) {
    newUsersWithNoDesign.map(async (user) => {
      // send email to the users 4 days old
      try {
        const db = admin.firestore();
        const userRef = db.collection("users").doc(user.uid);
        const userDoc = await userRef.get();

        const workspacesListRef = db
          .collection("users")
          .doc(user.uid)
          .collection("workspaces");
        const workspacesList = await workspacesListRef.get();
        if (userDoc.exists) {
          // check if the user exists
          const userDesignsRef = db
            .collection("workspaces")
            .doc(workspacesList.docs[0].id)
            .collection("designs");
          const userDesigns = await userDesignsRef.get();
          const designs = [];
          userDesigns.forEach((design) => {
            if (design.data()) {
              designs.push(design.data());
            }
          });
          if (designs.length > 0) {
            return logger.info(`User ${user.email} has uploaded designs.`);
          } else {
            await sendEmail({
              to: [
                {
                  email: userDoc.data()?.email,
                  name: userDoc.data()?.name,
                },
              ],
              templateID: 2,
            });
            logger.info(
              `Sending new user no design email to ${userDoc.data()?.email}`
            );
          }
        }
      } catch (e) {
        logger.error(
          `Error sending new user no design email to ${user.email}`,
          e
        );
      }
    });
  }
};
