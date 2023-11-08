import * as functions from "firebase-functions";
import { sendEmail } from "../../packages/sendEmail";
import * as logger from "firebase-functions/logger";
// eslint-disable-next-line no-use-before-define
const { CloudTasksClient } = require("@google-cloud/tasks");

const inviteCleanUpCloudTask = async (
  snapshot: functions.firestore.QueryDocumentSnapshot
) => {
  const project = process.env.PROJECT_ID as string;
  const queue = process.env.EXPIRED_INVITATIONS_QUEUE_NAME as string;
  const location = process.env.LOCATION as string;
  const url = process.env.EXPIRED_INVITATIONS_CLEANUP_FUNCTION_URL as string;
  const payload = { ref: snapshot.ref.path };
  const TTL = 7 * 24 * 60 * 60; // 7 days

  const tasksClient = new CloudTasksClient();
  const queuePath: string = tasksClient.queuePath(project, location, queue);

  const task = {
    // Creating Task and what task it need to perform
    httpRequest: {
      httpMethod: "POST",
      url, // Sending the delete function url
      headers: {
        "Content-Type": "application/json",
      },
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
    },
    scheduleTime: {
      seconds: Date.now() / 1000 + TTL,
    },
  };
  // Creating the task with the previous parameters me made
  await tasksClient.createTask({ parent: queuePath, task });
};

export const newInvitation = functions.firestore
  .document("workspaces/{workspaceId}/collaborators/{collaboratorsId}")
  .onCreate(async (snapshot) => {
    try {
      if ( snapshot.data().role === "owner" ) return;
      // making cleanup task
      await inviteCleanUpCloudTask(snapshot);
      logger.info("Created cleanup task");

      // sending invite email
      await sendEmail({
        to: [
          {
            email: snapshot.data().email,
            name: snapshot.data().name,
          },
        ],
        templateID: 6,
      });
      logger.info(`Sending invite email to ${snapshot.data().email}`);
    } catch (e) {
      logger.error(
        `Error sending invite email or creating cleanup task to ${
          snapshot.data().email
        }`,
        e
      );
    }
  });
