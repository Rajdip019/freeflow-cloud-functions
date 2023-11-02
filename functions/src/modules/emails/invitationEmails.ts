import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { sendEmail } from "../../packages/sendEmail";
import * as admin from "firebase-admin";

export const sendWorkspaceInviteEmail = functions.firestore
  .document("workspaces/{workspaceId}/collaborators/{collaboratorsId}")
  .onCreate(async (snapshot) => {
    sendEmail({
      to: [
        {
          email: snapshot.data().email,
          name: snapshot.data().name,
        },
      ],
      templateID: 1,
    });
  });
