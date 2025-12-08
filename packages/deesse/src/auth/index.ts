import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/react";

import { getConfig } from "../config";

export const auth = betterAuth(getConfig().auth);
export const authClient = createAuthClient()

export * from "better-auth";
export * from "better-auth/next-js";
