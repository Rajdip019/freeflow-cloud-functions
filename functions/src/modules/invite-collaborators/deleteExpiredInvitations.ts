import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

export const deleteExpiredInvitations = functions.https.onRequest(
  async (req: functions.Request, res: functions.Response) => {
    const { ref } = req.body as {
      ref: string;
    };
    const db = admin.firestore();
    const workspaceId = ref.split("/")[1];
    const collaboratorId = ref.split("/")[3];
    const dbRef = db
      .collection("workspaces")
      .doc(workspaceId)
      .collection("collaborators")
      .doc(collaboratorId);

    const snapshot = await dbRef.get();

    if (snapshot.exists) {
      const status = snapshot.data()?.status;
      if (status === "Pending") {
        const email = snapshot.data()?.email;
        logger.info(`Deleting expired invitation for ${email}`);
        await dbRef.delete();
        logger.info(`Deleted expired invitation for ${email}`);
        res.send(`Deleted expired invitation for ${email}`);
      } else {
        logger.info("Invitation already accepted or deleted");
        res.send("Invitation already accepted or deleted");
      }
    } else {
      logger.info("No invitation found");
      res.send("No invitation found");
    }
  }
);
