import { createClient } from '@/utils/supabase/server';
import GridComponent from '@/components/grid-component';
import type { ColDef } from "ag-grid-community";
import { useState } from 'react';

const colDefs: ColDef[] = [
  { field: "name", filter: true, },
  { field: "age", filter: 'agNumberColumnFilter', },
  { field: "nat", filter: true, },
  { field: "st", filter: 'agNumberColumnFilter', filterParams: { buttons: ['clear'] } },
  { field: "tk", filter: 'agNumberColumnFilter', },
  { field: "ps", filter: 'agNumberColumnFilter', },
  { field: "sh", filter: 'agNumberColumnFilter', },
  { field: "ag" },
  { field: "kab" },
  { field: "tab" },
  { field: "pab" },
  { field: "sab" },
  { field: "gam", filter: 'agNumberColumnFilter', },
  { field: "sub" },
  { field: "min", filter: 'agNumberColumnFilter', },
  { field: "mom" },
  { field: "sav" },
  { field: "con" },
  { field: "ktk" },
  { field: "kps" },
  { field: "sht" },
  { field: "gls", filter: 'agNumberColumnFilter', },
  { field: "ass" },
  { field: "dp" },
  { field: "inj" },
  { field: "sus" }
];

export default async function Players() {
  const supabase = await createClient();
  const { data: players } = await supabase.from("players").select();

  return <GridComponent rows={players ?? []} cols={colDefs} />
}