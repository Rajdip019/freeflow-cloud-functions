import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { IReviewImage } from "../../interfaces/IReviewDesigns";

export const newCommentAdded = functions.firestore
  .document("workspaces/{workspaceId}/designs/{designId}/comments/{commentId}")
  .onCreate(async (snapshot) => {
    const db = admin.firestore();
    const workspaceId = snapshot.ref.path.split("/")[1];
    const designId = snapshot.ref.path.split("/")[3];

    const designRef = db
      .collection("workspaces")
      .doc(workspaceId)
      .collection("designs")
      .doc(designId);
    const designSnapshot = await designRef.get();
    const design = designSnapshot.data() as IReviewImage;

    if (designSnapshot.exists) {
      const updates: Partial<IReviewImage> = {
        lastUpdated: Date.now(),
        newUpdate: "New Comment",
        totalSize: design.totalSize + snapshot.data().size,
      };

      await designRef.update(updates);
      logger.info(`new comment added for ${designId}`);
    } else {
      logger.error(`Design ${designId} not found`);
    }

    const workspaceRef = db.collection("workspaces").doc(workspaceId);
    const workspaceSnapshot = await workspaceRef.get();
    if (workspaceSnapshot.exists) {
      const workspace = workspaceSnapshot.data();
      await workspaceRef.update({
        storageUsed: workspace?.storageUsed + snapshot.data().size,
      });
    }
  });

export const commentDeleted = functions.firestore
  .document("workspaces/{workspaceId}/designs/{designId}/comments/{commentId}")
  .onDelete(async (snapshot) => {
    const db = admin.firestore();
    const workspaceId = snapshot.ref.path.split("/")[1];
    const designId = snapshot.ref.path.split("/")[3];

    const designRef = db
      .collection("workspaces")
      .doc(workspaceId)
      .collection("designs")
      .doc(designId);
    const designSnapshot = await designRef.get();
    const design = designSnapshot.data() as IReviewImage;

    // delete the file from storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(snapshot.data().imagePath);
    await file.delete();

    if (designSnapshot.exists) {
      const updates: Partial<IReviewImage> = {
        lastUpdated: Date.now(),
        totalSize: design.totalSize - snapshot.data().size,
      };

      await designRef.update(updates);
      logger.info(`comment deleted for ${designId}`);
    } else {
      logger.error(`Design ${designId} not found`);
    }

    const workspaceRef = db.collection("workspaces").doc(workspaceId);
    const workspaceSnapshot = await workspaceRef.get();
    if (workspaceSnapshot.exists) {
      const workspace = workspaceSnapshot.data();
      await workspaceRef.update({
        storageUsed: workspace?.storageUsed - snapshot.data().size,
      });
    }
  });
