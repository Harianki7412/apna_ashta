import type { DefaultSession } from "next-auth";
import type { Role } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      phoneVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    phoneVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    phoneVerified: boolean;
  }
}
