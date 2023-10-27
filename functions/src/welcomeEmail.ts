import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { addContact } from "./packages/contactList";
import { sendEmail } from "./packages/sendEmail";

export const sendWelcomeEmail = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snapshot) => {
    const user = snapshot.data();
    logger.info(`Adding ${user.email} to contact list`);
    await addContact({
      email: user.email,
      attributes: {
        FIRSTNAME: user.name.split(" ")[0],
        LASTNAME: user.name.split(" ")[1],
      },
      updateEnabled: true,
    });
    logger.info(`Sending welcome email to ${user.email}`);
    await sendEmail({
      to: [
        {
          email: user.email,
          name: user.name,
        },
      ],
      templateID: 1,
    });
  });
