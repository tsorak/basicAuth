import { createSignal, Show } from "solid-js";
import { useParams, useRouteData } from "solid-start";
import { FormError } from "solid-start/data";
import { createServerAction$, createServerData$, redirect } from "solid-start/server";
import { db } from "~/db";
import { createUserSession, getUser, login, register } from "~/db/session";

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 1) {
    return `Usernames must be at least 1 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 1) {
    return `Passwords must be at least 1 characters long`;
  }
}

export function routeData() {
  return createServerData$(async (_, { request }) => {
    if (await getUser(request)) {
      throw redirect("/");
    }
    return {};
  });
}

export default function Login() {
  const data = useRouteData<typeof routeData>();
  const params = useParams();

  const [loggingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const loginType = form.get("loginType");
    const username = form.get("username");
    const password = form.get("password");
    const redirectTo = form.get("redirectTo") || "/";
    if (typeof loginType !== "string" || typeof username !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
      throw new FormError(`Form not submitted correctly.`);
    }

    const fields = { loginType, username, password };
    const fieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
      throw new FormError("Fields invalid", { fieldErrors, fields });
    }

    switch (loginType) {
      case "login": {
        const user = await login({ username, password });
        if (!user) {
          throw new FormError(`Username/Password combination is incorrect`, {
            fields,
          });
        }
        return createUserSession(`${user.id}`, redirectTo);
      }
      case "register": {
        const userExists = await db.user.findUnique({ where: { username } });
        if (userExists) {
          throw new FormError(`User with username ${username} already exists`, {
            fields,
          });
        }
        const user = await register({ username, password });
        if (!user) {
          throw new FormError(`Something went wrong trying to create a new user.`, {
            fields,
          });
        }
        return createUserSession(`${user.id}`, redirectTo);
      }
      default: {
        throw new FormError(`Login type invalid`, { fields });
      }
    }
  });

  const [isLogin, setIsLogin] = createSignal(true);

  return (
    <main class="flex-grow flex flex-col items-center justify-center">
      <Form class="flex flex-col items-center bg-white p-8 rounded-md border border-[hsl(220,5%,89%)] gap-2 w-min">
        <input type="hidden" name="redirectTo" value={params.redirectTo ?? "/"} />
        <h1 class="text-3xl">Basic Auth</h1>
        <div class="flex flex-col w-full mt-5">
          <label class="select-none text-sm" for="username-input">
            Username
          </label>
          <input class="focus:outline-none border border-[hsl(220,5%,89%)] rounded p-1 w-72" name="username" autocomplete="off" />
        </div>
        <Show when={loggingIn.error?.fieldErrors?.username} fallback={<div class="spacer h-5 w-full" />}>
          <p role="alert" class="text-sm">
            {loggingIn.error.fieldErrors.username}
          </p>
        </Show>
        <div class="flex flex-col w-full">
          <label class="select-none text-sm" for="password-input">
            Password
          </label>
          <input class="focus:outline-none border border-[hsl(220,5%,89%)] rounded p-1 w-72" name="password" type="password" />
        </div>
        <Show when={loggingIn.error?.fieldErrors?.password} fallback={<div class="spacer h-5 w-full" />}>
          <p role="alert" class="text-sm">
            {loggingIn.error.fieldErrors.password}
          </p>
        </Show>
        <div class="grid grid-cols-[repeat(2,1fr)] bg-[hsl(210,20%,93%)] rounded-md overflow-hidden h-8 w-full">
          <div class="flex flex-col items-center">
            <input type="radio" name="loginType" value="login" id="login" checked={isLogin()} class="peer hidden" onChange={() => setIsLogin(true)} />
            <label for="login" class="flex items-center flex-grow w-full px-2 peer-checked:bg-blue-500 peer-checked:text-white transition-colors cursor-pointer peer-checked:cursor-default">
              <span class="mx-auto w-min">Login</span>
            </label>
          </div>
          <div class="flex flex-col items-center">
            <input type="radio" name="loginType" value="register" id="register" class="peer hidden" onChange={() => setIsLogin(false)} />
            <label for="register" class="flex items-center flex-grow w-full px-2 peer-checked:bg-blue-500 peer-checked:text-white transition-colors cursor-pointer peer-checked:cursor-default">
              <span class="mx-auto w-min">Register</span>
            </label>
          </div>
        </div>
        <Show when={loggingIn.error} fallback={<div class="spacer h-5 w-full" />}>
          <p role="alert" id="error-message" class="text-sm">
            {loggingIn.error.message}
          </p>
        </Show>
        <button type="submit" class="bg-blue-500 w-full">
          {data() ? (isLogin() ? "Login" : "Register") : ""}
        </button>
      </Form>
    </main>
  );
}
