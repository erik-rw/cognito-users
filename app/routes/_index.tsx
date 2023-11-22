import type { DataFunctionArgs, MetaFunction } from "@remix-run/node";
import { getAllUsers } from "~/cognito";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Cognito User List" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: DataFunctionArgs) => {
  const users = (await getAllUsers()).sort((a, b) =>
    a.email.localeCompare(b.email)
  );
  return json({ users });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Cognito User List</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Sub</th>
              <th>Email</th>
              <th>Email isVerified</th>
              <th>Enabled</th>
              <th>Created At</th>
              <th>Modified At</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.sub}>
                <th>{user.sub}</th>
                <td>{user.email}</td>
                <td>{String(user.email_verified)}</td>
                <td>{String(user.enabled)}</td>
                <td>{user.createdAt}</td>
                <td>{user.modifiedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
