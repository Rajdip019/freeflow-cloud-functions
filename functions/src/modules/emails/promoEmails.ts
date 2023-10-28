import * as logger from "firebase-functions/logger";
import { sendEmail } from "../../packages/sendEmail";
import * as admin from "firebase-admin";

export const sendFeaturesMail = (users: admin.auth.UserRecord[] = []) => {
  // Filters that the user is more than 7 days but less than 8 days old
  const newUsers = users.filter(
    (user) =>
      Date.parse(user.metadata.creationTime) >
        Date.now() - 7 * 24 * 60 * 60 * 1000 &&
      Date.parse(user.metadata.creationTime) <
        Date.now() - 8 * 24 * 60 * 60 * 1000
  );

  if (newUsers.length > 0) {
    newUsers.map(async (user) => {
      // send email to the users 7 days old
      try {
        const db = admin.firestore();
        const userRef = db.collection("users").doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          // check if the user exists
          sendEmail({
            to: [
              {
                email: doc.data()?.email,
                name: doc.data()?.name,
              },
            ],
            templateID: 1,
          });
          logger.info(`Sending welcome email to ${doc.data()?.email}`);
        }
      } catch (e) {
        logger.error(`Error sending welcome email to ${user.email}`, e);
      }
    });
  }
};
