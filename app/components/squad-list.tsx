import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { PlayerDto } from "@/lib/data/dataSource";

export const columns: ColumnDef<PlayerDto>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "transferStatus",
    header: "Squad status",
  },
  {
    accessorKey: "marketValue",
    header: "Market value",
  },
];

const PlayerList = ({
  title,
  players,
}: {
  title: string;
  players: PlayerDto[];
}) => (
  <div>
    <h2 className="scroll-m-20 font-semibold tracking-tight">{title}</h2>
    {players.map((player) => (
      <div key={player.id}>{player.name}</div>
    ))}
  </div>
);

export function SquadList({ players }: { players: PlayerDto[] }) {
  const table = useReactTable({
    data: players,
    columns,
    // globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="grid grid-cols-4">
      <div id="gks" className="">
        <PlayerList
          title="GK"
          players={players.filter((p) => p.pos === "GK")}
        />
      </div>
      <div id="dfs" className="">
        <PlayerList
          title="DF"
          players={players.filter((p) => p.pos === "DF")}
        />
      </div>
      <div id="mfs" className="">
        <PlayerList
          title="MF"
          players={players.filter(
            (p) => p.pos === "MF" || p.pos === "DM" || p.pos === "AM"
          )}
        />
      </div>
      <div id="fws" className="">
        <PlayerList
          title="FW"
          players={players.filter((p) => p.pos === "FW")}
        />
      </div>
    </div>
  );
}
