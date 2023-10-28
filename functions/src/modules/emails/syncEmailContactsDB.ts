import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { deleteContact, updateContact } from "../../packages/contactList";

export const syncUpdatesEmailContactsDB = functions.firestore
  .document("users/{userId}")
  .onUpdate(async ({ before, after }) => {
    if (after.data()) {
      const oldName = before.data().name;
      const newName = after.data().name;

      if (oldName !== newName) {
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
    }
  });

export const syncDeleteEmailContactsDB = functions.firestore
  .document("users/{userId}")
  .onDelete(async (snapshot) => {
    const user = snapshot.data();
    logger.info(`Deleting ${user.name} from contact list`);
    await deleteContact(user.email);
    return logger.info(`Deleted ${user.name} from contact list`);
  });
