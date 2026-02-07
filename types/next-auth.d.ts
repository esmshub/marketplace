import { User } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface SessionUser extends Omit<User, "id"> {
    id: number
    isAdmin: boolean
    username: string
    providerId: string
  }


  interface Session {
    user: SessionUser
  }
}