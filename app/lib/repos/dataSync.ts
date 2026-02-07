import { DataSync } from "../domain/dataSync";
import { DataSyncUncheckedCreateInput, DataSyncUpdateInput } from "../generated/prisma/models";
import { mapToDataSync } from "../mapper";
import { prisma } from "./prisma";

export async function createDataSync(data: DataSyncUncheckedCreateInput): Promise<DataSync>{
  const dataSync = await prisma.dataSync.create({
    data
  });
  return mapToDataSync(dataSync);
}

export async function updateDataSync(id: number, data: DataSyncUpdateInput): Promise<DataSync>{
  const dataSync = await prisma.dataSync.update({
    where: {
      id,
    },
    data
  });
  return mapToDataSync(dataSync);
}