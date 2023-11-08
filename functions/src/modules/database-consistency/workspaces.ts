import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// syncs the workspace name and avatarUrl from workspace>>collaborators to user>>workspaces
export const workspaceDataUpdateConsistency = functions.firestore
  .document("workspaces/{workspaceId}")
  .onUpdate(async ({ before, after }) => {
    const db = admin.firestore();
    if (
      before.data().name !== after.data().name ||
      before.data().avatarUrl !== after.data().avatarUrl
    ) {
      logger.info(
        `Workspace name changed from ${before.data().name} to ${
          after.data().name
        }`
      );
      logger.info(
        `Workspace avatarUrl changed from ${before.data().avatarUrl} to ${
          after.data().avatarUrl
        }`
      );

      // get all collaborates of the workspace
      const collaborators = await after.ref.collection("collaborators").get();
      logger.info(`Found ${collaborators.docs.length} collaborators`);

      // update the workspace name of all collaborators batch update
      const batch = db.batch();
      collaborators.docs.map(async (collaborator) => {
        try {
          const collaboratesRef = db
            .collection("users")
            .doc(collaborator.id)
            .collection("workspaces")
            .doc(after.id);
          batch.update(collaboratesRef, {
            name: after.data().name,
            avatarUrl: after.data().avatarUrl,
          });
          logger.info(`Updated workspace name for ${collaborator.id}`);
        } catch (e) {
          logger.error(
            `Error updating workspace name for ${collaborator.id}`,
            e
          );
        }
      });
      await batch.commit();
    }
  });

export const workspaceDataDeleteConsistency = functions.firestore
  .document("workspaces/{workspaceId}")
  .onDelete(async (snapshot) => {
    const db = admin.firestore();
    const collaborators = await snapshot.ref.collection("collaborators").get();
    logger.info(`Found ${collaborators.docs.length} collaborators`);

    // delete the workspace from all collaborators batch update
    const batch = db.batch();
    collaborators.docs.map(async (collaborator) => {
      try {
        const collaboratesRef = db
          .collection("users")
          .doc(collaborator.id)
          .collection("workspaces")
          .doc(snapshot.id);
        batch.delete(collaboratesRef);
        logger.info(`Deleted workspace for ${collaborator.id}`);
      } catch (e) {
        logger.error(`Error deleting workspace for ${collaborator.id}`, e);
      }
    });
    await batch.commit();
  });
