import { User } from "../domain/user";
import { UserInclude, UserUncheckedCreateInput } from "../generated/prisma/models";
import { mapToUser } from "../mapper";
import { prisma } from "./prisma";

export async function getUser(id: number, include?: UserInclude): Promise<User | null>{
  const user = await prisma.user.findUnique({where: {id}, include});
  return user ? mapToUser(user) : null;
}

export async function getUserByEmail(emailAddress: string, include?: UserInclude): Promise<User | null>{
  const user = await prisma.user.findUnique({where: {emailAddress}, include});
  return user ? mapToUser(user) : null;
}

export async function createUser(data: UserUncheckedCreateInput): Promise<User> {
  const newUser = await prisma.user.create({ data});
  return mapToUser(newUser);
}