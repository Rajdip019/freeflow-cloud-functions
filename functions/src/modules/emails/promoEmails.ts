import * as logger from "firebase-functions/logger";
import { sendEmail } from "../../packages/sendEmail";
import * as admin from "firebase-admin";

export const sendFeaturesMail = async (users: admin.auth.UserRecord[] = []) => {
  // Filters that the user is more than 7 days but less than 8 days old
  const newUsers = users.filter(
    (user) =>
      Date.parse(user.metadata.creationTime) < Date.now() - 7 * 24 * 60 * 60 * 1000 &&
      Date.parse(user.metadata.creationTime) >
        Date.now() - 8 * 24 * 60 * 60 * 1000
  );
  logger.info(`Found ${newUsers.length} new users for promo email`);
  if (newUsers.length > 0) {
    newUsers.map(async (user) => {
      // send email to the users 7 days old
      try {
        const db = admin.firestore();
        const userRef = db.collection("users").doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          // check if the user exists
          await sendEmail({
            to: [
              {
                email: user.email as string,
                name: doc.data()?.name as string,
              },
            ],
            templateID: 1,
          });
          logger.info(`Sending promo email to ${user.email}`);
        } else {
          logger.info(`User ${user.email} does not exist in firestore`);
        }
      } catch (e) {
        logger.error(`Error sending promo email to ${user.email}`, e);
      }
    });
  }
};
