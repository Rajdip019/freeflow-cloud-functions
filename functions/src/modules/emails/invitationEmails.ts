import * as functions from "firebase-functions";
import { sendEmail } from "../../packages/sendEmail";

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
