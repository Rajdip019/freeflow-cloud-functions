import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { updateContact } from "./packages/contactList";

export const syncEmailContactsDB = functions.firestore
  .document("users/{userId}")
  .onUpdate(async ({ before, after }) => {
    const oldName = before.data().name;
    const newName = after.data().name;

    if (oldName !== oldName) {
      logger.info(
        `Updating ${oldName} to ${newName} in contact list for ${
          after.data().email
        }`
      );
      await updateContact({
        email: after.data().email,
        attributes: {
          FIRSTNAME: newName.split(" ")[0],
          LASTNAME: newName.split(" ")[1],
        },
        updateEnabled: true,
      });
      return logger.info(
        `Updated ${oldName} to ${newName} in contact list for ${
          after.data().email
        }`
      );
    }
  });
