"use server";

import { auth } from "@/auth";
import { AuthnError, AuthzError, NotFoundError, ValidationError } from "@/lib/errors";
import { getGame } from "@/lib/repos/game";
import * as z from "zod"; 
import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers";
import { DataSyncDto, DataSyncFailedMetadata, DataSyncSuccessfulMetadata } from "@/lib/domain/dataSync";
import { revalidateTag } from "next/cache";

interface SyncResponse {
  startTime: string;
  endTime: string;
  metadata: DataSyncSuccessfulMetadata | DataSyncFailedMetadata
}

const DataSyncForm = z.object({ 
  gameId: z.coerce.number().int(),
  sourceUrl: z.url()
});

export async function syncGameData(initialState: object, formData: FormData): Promise<DataSyncDto | { [key: string]: string }> {
  // return { error: "Unknown error has occurred" };
  const form = DataSyncForm.safeParse({
    gameId: formData.get("gameId"),
    sourceUrl: formData.get("sourceUrl")
  });
  if (!form.success) throw new ValidationError(form.error.message);

  const session = await auth();
  if (!session?.user) throw new AuthnError("User is not authenticated");
  if (!session?.user?.isAdmin) throw new AuthzError("User is forbidden");

  const game = await getGame(form.data.gameId, { dataSyncs: true });
  if (!game) throw new NotFoundError("Game not found");

  const res = await fetch(`${process.env.API_ROOT}/api/games/${form.data.gameId}/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXTAUTH_SECRET}`, // or pass full JWT if you like
    },
    body: JSON.stringify({
      userId: session.user.id,
      sourceUrl: form.data.sourceUrl
    }),
  });

  // attempt to deserialize response (successful or not)
  try {
    const body = await res.json();
    return body;
  } catch (e) {
    console.warn(e);
    return {
      error: "Unknown error has occurred"
    }
  }
}

export async function invalidateCache(initialState: object, formData: FormData): Promise<object> {
  ["clubs", "players", "discord"].map(tag => {
    revalidateTag(tag, "max");
    console.log(`Invalidated ${tag}`);
  });
  
  return {};
}