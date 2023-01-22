import { For } from "solid-js";
import { refetchRouteData, useRouteData } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { logout } from "~/db/session";
import { useUsers } from "~/db/useUsers";
import { useUser } from "../db/useUser";

export function routeData() {
  return { user: useUser(), users: useUsers() };
}

export default function Home() {
  const { user, users } = useRouteData<typeof routeData>();
  const [, { Form }] = createServerAction$((f: FormData, { request }) => logout(request));

  return (
    <main class="w-full p-4 space-y-2">
      <h1 class="font-bold text-3xl">Hello {user()?.username}</h1>
      <h3 class="font-bold text-xl">Users</h3>
      <table>
        <thead>
          <tr>
            <th class="px-2" scope="col">
              Name
            </th>
            <th class="px-2" scope="col">
              Created At
            </th>
            <th class="px-2" scope="col">
              Last Login
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={users() ?? false} fallback={<p>Empty</p>}>
            {(item) => {
              return (
                <tr>
                  <td class="px-2">{item.username}</td>
                  <td class="px-2">{new Date(item.createdAt).toJSON().replace("T", " ").split(".")[0]}</td>
                  <td class="px-2">{item.lastLogin ? new Date(item.lastLogin).toJSON().replace("T", " ").split(".")[0] : "-"}</td>
                  {/* <p>{`${item.username} ${new Date(item.createdAt).toJSON().replace("T", " ").split(".")[0]}`}</p> */}
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>
      <div class="flex gap-2">
        <button onClick={() => refetchRouteData()}>Refresh</button>
        <Form>
          <button name="logout" type="submit">
            Logout
          </button>
        </Form>
      </div>
    </main>
  );
}
