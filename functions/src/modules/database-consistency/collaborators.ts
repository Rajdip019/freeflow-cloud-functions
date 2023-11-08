import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// syncs the user updates from user to workspaces>>collaborators
export const collaboratesDataUpdateConsistency = functions.firestore
  .document("users/{userId}")
  .onUpdate(async ({ before, after }) => {
    const db = admin.firestore();

    // get all workspaces for user
    const workspaces = await after.ref.collection("workspaces").get();
    logger.info(`Found ${workspaces.docs.length} workspaces`);

    // update the collaborates of all workspaces batch update
    if (
      before.data().name !== after.data().name ||
      before.data().imageURL !== after.data().imageURL ||
      before.data().email !== after.data().email
    ) {
      const batch = db.batch();
      workspaces.docs.map((workspace) => {
        try {
          const collaboratesRef = db
            .collection("workspaces")
            .doc(workspace.id)
            .collection("collaborators")
            .doc(after.id);
          batch.update(collaboratesRef, {
            name: after.data().name,
            imageURL: after.data().imageURL,
            email: after.data().email,
          });
          logger.info(`Updated collaborates for ${workspace.id}`);
        } catch (e) {
          logger.error(`Error updating collaborates for ${workspace.id}`, e);
        }
      });
      await batch.commit();
    } else {
      logger.info("No changes in collaborates");
    }
  });

// syncs the user deletes from user to workspaces>>collaborators
export const collaboratesDataDeleteConsistency = functions.firestore
  .document("users/{userId}")
  .onDelete(async (snapshot) => {
    const db = admin.firestore();
    const workspaces = await snapshot.ref.collection("workspaces").get();
    logger.info(`Found ${workspaces.docs.length} workspaces`);

    // delete the collaborates from all workspaces batch update
    const batch = db.batch();
    workspaces.docs.map(async (workspace) => {
      try {
        const collaboratesRef = db
          .collection("workspaces")
          .doc(workspace.id)
          .collection("collaborators")
          .doc(snapshot.id);
        batch.delete(collaboratesRef);
        logger.info(`Deleted collaborates for ${workspace.id}`);
      } catch (e) {
        logger.error(`Error deleting collaborates for ${workspace.id}`, e);
      }
    });
    await batch.commit();
  });
