import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { IReviewImage } from "../../interfaces/IReviewDesigns";

export const newVersionUploaded = functions.firestore
  .document("workspaces/{workspaceId}/designs/{designId}/versions/{versionId}")
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
        latestVersion: snapshot.data().version,
        latestImageURL: snapshot.data().imageURL,
        lastUpdated: snapshot.data().timeStamp,
        totalSize: design.totalSize + snapshot.data().size,
        newUpdate: "New Version Uploaded",
      };

      await designRef.update(updates);
      logger.info(`Updated latestVersion for ${designId}`);
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

export const versionDeleted = functions.firestore
  .document("workspaces/{workspaceId}/designs/{designId}/versions/{versionId}")
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
        latestVersion: snapshot.data().version,
        latestImageURL: snapshot.data().imageURL,
        lastUpdated: snapshot.data().timeStamp,
        totalSize: design.totalSize - snapshot.data().size,
        newUpdate: "Version Deleted",
      };

      await designRef.update(updates);
      logger.info(`Updated latestVersion for ${designId}`);
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
