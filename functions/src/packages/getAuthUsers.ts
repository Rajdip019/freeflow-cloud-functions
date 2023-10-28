import * as admin from "firebase-admin";

export const getUsers = async (
  users: admin.auth.UserRecord[] = [],
  nextPageToken: string | undefined = undefined
): Promise<admin.auth.UserRecord[]> => {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  // Find users that have created their account in the last 1 day.
  const newUser = result.users;

  // Concat with list of previously found new users if there was more than 1000 users.
  users = users.concat(...newUser);

  // If there are more users to fetch we fetch them.
  if (result.pageToken) {
    return getUsers(users, result.pageToken);
  }
  return users;
};
