# Freeflow Cloud Functions 
This repo mainly contains all the cloud functions that has been used in [Freeflow](https://github.com/Rajdip019/freeflow). These are mainly db trigger fuctions and some cleanup functions to be presice.

## Deplooying Cloud functions:
### Prerequisit:
A GCP Billing account. ( You need to put in your card details here ). As Firebase Balze plan needs to be active to deploy and use cloud functions. Also priror knowledge about firebase is important.

1. **Setup Environment variables:** Copy the `.env.example` file content to `.env` file.
2. **Creating a new firebase app:** Create a new firebase app and in that process chosee web. You find all the environemt variables in the process except `EXPIRED_INVITATIONS_QUEUE_NAME` and `EXPIRED_INVITATIONS_CLEANUP_FUNCTION_URL`.
3. **Upgrading Plan:** Link your app with the bGCP billing account and upgrade it top Blaze plan. Don't worry you will not be charged anything until and unless you use it a lot. There is a pretty generous free tier available.
5. **Creating a task queue:** Create a task queue from the GCP console and checkout this article for more info. [Create task Queue](https://cloud.google.com/tasks/docs/creating-queues). Once done you can use the queue name for the `EXPIRED_INVITATIONS_QUEUE_NAME` envirnment variable. Make sure to create the task queue in the same Location/ Region as all the firebase functions.
6. **Deploy:** Open ternimal in the root folder of the project and type this following commands.
 ```
   cd functions
   npm run depoy
```
7. **Getting the `EXPIRED_INVITATIONS_CLEANUP_FUNCTION_URL` variable: Once the deployemt is successfiul you will get a link in your terminal fot the cleanup http function. Put the link in the environemt variable.
8. **Final Deployment:** Run `npm run deploy` in the ternimal to deploy the cloud functions finally.

## List of all the clouf functions:
1. newVersionUploaded
2. versionDeleted
3. newCommentAdded
4. commentDeleted
5. designDeleteCleanup
6. deleteReplies
7. sendWelcomeEmails
8. syncDeleteEmailContactsDB
9. syncUpdatesEmailContactsDB
10. workspaceDataUpdateConsistency
11. workspaceDataDeleteConsistency
12. collaboratesDataUpdateConsistency
13. collaboratesDataDeleteConsistency
14. collaboratesInsideWorkspaceDataDeleteConsistency
15. workspaceInsideUsersDataDeleteConsistency
16. roleAndStatusConsistencyUser
17. roleAndStatusConsistencyWorkspace
18. deleteExpiredInvitations // http function

There is a toptal of 18 cloud functions that mainly maintains the inegrity of the data. 
   
