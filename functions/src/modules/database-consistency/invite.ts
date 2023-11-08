import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// syncs the workspace delete from workspace>>collaborators to user>>workspaces
export const workspaceInsideUsersDataDeleteConsistency =
  functions.firestore
    .document("workspaces/{workspaceId}/collaborators/{collaboratorId}")
    .onDelete(async (snapshot) => {
      const db = admin.firestore();
      const workspaceId = snapshot.ref.path.split("/")[1];
      const collaboratorId = snapshot.ref.path.split("/")[3];

      // delete the collaborates from all workspaces batch update
      const ref = db
        .collection("users")
        .doc(collaboratorId)
        .collection("workspaces")
        .doc(workspaceId);
      await ref.delete();
      logger.info(`Deleted collaborates for ${workspaceId}`);
    });

// syncs the user delete from user>>workspaces to workspace>>collaborators
export const collaboratesInsideWorkspaceDataDeleteConsistency =
  functions.firestore
    .document("users/{userId}/workspaces/{workspaceId}")
    .onDelete(async (snapshot) => {
      const db = admin.firestore();
      const workspaceId = snapshot.ref.path.split("/")[3];
      const userId = snapshot.ref.path.split("/")[1];

      // delete the workspace from all collaborators batch update
      const ref = db
        .collection("workspaces")
        .doc(workspaceId)
        .collection("collaborators")
        .doc(userId);
      await ref.delete();
      logger.info(`Deleted workspace for ${userId}`);
    });

// syncs the status and role from workspace>>collaborators to user>>workspaces
export const roleAndStatusConsistencyUser = functions.firestore
  .document("workspaces/{workspaceId}/collaborators/{collaboratorId}")
  .onUpdate(async ({ before, after }) => {
    const db = admin.firestore();
    if (
      before.data().role !== after.data().role ||
      before.data().status !== after.data().status
    ) {
      logger.info(
        `Workspace role changed from ${before.data().role} to ${
          after.data().role
        }`
      );
      logger.info(
        `Workspace status changed from ${before.data().status} to ${
          after.data().status
        }`
      );
      const workspaceId = after.ref.path.split("/")[1];
      const userId = after.ref.path.split("/")[3];

      const ref = db
        .collection("users")
        .doc(userId)
        .collection("workspaces")
        .doc(workspaceId);

      // update role and status
      await ref.update({
        role: after.data().role,
        status: after.data().status,
      });
    }
  });

// syncs the status and role from user>>workspaces to workspace>>collaborators
export const roleAndStatusConsistencyWorkspace = functions.firestore
  .document("users/{userId}/workspaces/{workspaceId}")
  .onUpdate(async ({ before, after }) => {
    const db = admin.firestore();
    if (
      before.data().role !== after.data().role ||
      before.data().status !== after.data().status
    ) {
      logger.info(
        `Workspace role changed from ${before.data().role} to ${
          after.data().role
        }`
      );
      logger.info(
        `Workspace status changed from ${before.data().status} to ${
          after.data().status
        }`
      );
      const workspaceId = after.ref.path.split("/")[3];
      const userId = after.ref.path.split("/")[1];

      const ref = db
        .collection("workspaces")
        .doc(workspaceId)
        .collection("collaborators")
        .doc(userId);

      // update role and status
      await ref.update({
        role: after.data().role,
        status: after.data().status,
      });
    }
  });
