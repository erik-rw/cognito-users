import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { z } from "zod";

const configSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string({
    required_error:
      "AWS_ACCESS_KEY_ID is required. Export the AWS_ACCESS_KEY_ID environment variable.",
  }),
  AWS_SECRET_ACCESS_KEY: z.string({
    required_error:
      "AWS_SECRET_ACCESS_KEY is required. Export the AWS_SECRET_ACCESS_KEY environment variable.",
  }),
  AWS_REGION: z.string({
    required_error:
      "AWS_REGION is required. Export the AWS_REGION environment variable.",
  }),
  COGNITO_USER_POOL_ID: z.string({
    required_error:
      "UserPoolId is required. Export the COGNITO_USER_POOL_ID environment variable.",
  }),
});
const config = configSchema.parse(process.env);

const client = new CognitoIdentityProviderClient({ region: config.AWS_REGION });
const UserPoolId = config.COGNITO_USER_POOL_ID;

export type User = {
  sub: string;
  email: string;
  email_verified: boolean;
  enabled: boolean;
  createdAt: string;
  modifiedAt: string;
};

function createCommand(token?: string) {
  return new ListUsersCommand({
    UserPoolId,
    PaginationToken: token,
  });
}

export async function getAllUsers() {
  const users: User[] = [];
  let cmd: ListUsersCommand | undefined = createCommand();
  while (cmd) {
    console.log("Query Cognito");
    const response = await client.send(cmd);
    const respUsers = response.Users || [];
    const newUsers = respUsers.map((user) => ({
      sub: user.Attributes?.find((attr) => attr.Name === "sub")?.Value || "",
      email:
        user.Attributes?.find((attr) => attr.Name === "email")?.Value || "",
      email_verified:
        user.Attributes?.find((attr) => attr.Name === "email_verified")
          ?.Value === "true",
      enabled: user.Enabled || false,
      createdAt: user.UserCreateDate?.toISOString() || "",
      modifiedAt: user.UserLastModifiedDate?.toISOString() || "",
    }));
    newUsers?.forEach((user) => users.push(user));
    if (newUsers.length > 0 && response.PaginationToken) {
      cmd = createCommand(response.PaginationToken);
    } else {
      cmd = undefined;
    }
  }
  return users;
}
