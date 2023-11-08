import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const deleteQueryBatch = async (
  db: admin.firestore.Firestore,
  ref: admin.firestore.CollectionReference<admin.firestore.DocumentData>,
  resolve: any
) => {
  const snapshot = await ref.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, ref, resolve);
  });
};

export const designDeleteCleanup = functions.firestore
  .document("workspaces/{workspaceId}/designs/{designId}")
  .onDelete(async (snapshot) => {
    try {
      const db = admin.firestore();

      // get all versions and delete them
      const versions = snapshot.ref.collection("versions");
      const comments = snapshot.ref.collection("comments");

      await new Promise((resolve) => {
        deleteQueryBatch(db, versions, resolve);
      });
      logger.info(`Deleted versions for ${snapshot.id}`);

      await new Promise((resolve) => {
        deleteQueryBatch(db, comments, resolve);
      });
      logger.info(`Deleted comments for ${snapshot.id}`);
    } catch {
      logger.error("Error deleting versions or comments");
    }
  });

export const deleteReplies = functions.firestore
  .document("workspaces/{workspaceId}/designs/{designId}/comments/{commentId}")
  .onDelete(async (snapshot) => {
    try {
      const db = admin.firestore();

      // get all versions and delete them
      const replies = snapshot.ref.collection("replies");

      await new Promise((resolve) => {
        deleteQueryBatch(db, replies, resolve);
      });
      logger.info(`Deleted replies for ${snapshot.id}`);
    } catch {
      logger.error("Error deleting replies");
    }
  });
