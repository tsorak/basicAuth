import { createServerData$ } from "solid-start/server";
import { db } from ".";

export const useUsers = () =>
  createServerData$(async () => {
    try {
      const users = db.user.findMany();
      return users;
    } catch (error) {
      return undefined;
    }
  });
