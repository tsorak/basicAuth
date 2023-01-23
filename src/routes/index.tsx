import { For } from "solid-js";
import { refetchRouteData, useRouteData } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { logout } from "~/db/session";
import { useUsers } from "~/db/useUsers";
import { useUser } from "../db/useUser";

import { getTime } from "~/utils/time";

export function routeData() {
  return { user: useUser(), users: useUsers() };
}

export default function Home() {
  const { user, users } = useRouteData<typeof routeData>();
  const [, { Form }] = createServerAction$((f: FormData, { request }) => logout(request));

  return (
    <main class="flex-grow flex flex-col items-center justify-center gap-6">
      <h1 class="font-bold text-3xl">Hello {user()?.username}</h1>
      <div class="max-w-7xl min-w-min">
        <h3 class="font-bold text-xl">Users</h3>
        <p class="text-[hsl(222,8%,46%)] text-sm ml-1">A list of all entries in the users database</p>
        <div class="rounded-md border border-[hsl(220,5%,89%)] overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="bg-[hsl(210,20%,98%)]">
                <th scope="col">Name</th>
                <th scope="col">Created At</th>
                <th scope="col">Last Login</th>
              </tr>
            </thead>
            <tbody>
              <For each={users() ?? false} fallback={<p>Empty</p>}>
                {(item) => {
                  return (
                    <tr class="bg-white">
                      <td>{item.username}</td>
                      <td class="text-[hsl(222,8%,46%)]">{getTime(item.createdAt, Date.now()).toJSON().replace("T", " ").split(".")[0]}</td>
                      <td class="text-[hsl(222,8%,46%)]">{item.lastLogin ? getTime(item.lastLogin, Date.now()).toJSON().replace("T", " ").split(".")[0] : "-"}</td>
                      {/* <p>{`${item.username} ${new Date(item.createdAt).toJSON().replace("T", " ").split(".")[0]}`}</p> */}
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="bg-blue-500" onClick={() => refetchRouteData()}>
          Refresh
        </button>
        <Form>
          <button name="logout" type="submit" class="bg-red-600 hover:bg-red-500">
            Logout
          </button>
        </Form>
      </div>
    </main>
  );
}
