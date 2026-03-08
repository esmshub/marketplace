import { ListOrderedIcon, ShieldBanIcon, Users } from "lucide-react";
import {
  DataSyncDto,
  DataSyncFailedMetadata,
  DataSyncSuccessfulMetadata,
} from "@/lib/domain/dataSync";
import { timeAgo } from "@/lib/time";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SuccessfulSyncInfo = ({ data }: { data: DataSyncSuccessfulMetadata }) => {
  return (
    <Table className="w-sm">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]"></TableHead>
          <TableHead>Added</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead>Failed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="inline-flex items-center gap-x-1">
            <ShieldBanIcon /> Clubs
          </TableCell>
          <TableCell>{data.clubs.inserted}</TableCell>
          <TableCell>{data.clubs.updated}</TableCell>
          <TableCell>{data.clubs.failed}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="inline-flex items-center gap-x-1">
            <Users /> Players
          </TableCell>
          <TableCell>{data.players.inserted}</TableCell>
          <TableCell>{data.players.updated}</TableCell>
          <TableCell>{data.players.failed}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="inline-flex items-center gap-x-1">
            <ListOrderedIcon /> Leagues
          </TableCell>
          <TableCell>{data.leagues.inserted}</TableCell>
          <TableCell>{data.leagues.updated}</TableCell>
          <TableCell>{data.leagues.failed}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default function SyncResult({ data }: { data: DataSyncDto }) {
  const failed = !!data.metadata && "error" in data.metadata;
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="py-2 text-xs justify-start">
          Sync {data.status}{" "}
          {timeAgo(new Date(data.endTime ?? data.startTime ?? 0))}
        </AccordionTrigger>
        <AccordionContent>
          {failed && (
            <>
              <p className="text-sm">Sync error</p>
              <div className="text-muted-foreground text-xs">
                {(data.metadata as DataSyncFailedMetadata).error}
              </div>
            </>
          )}
          {!failed && (
            <SuccessfulSyncInfo
              data={data.metadata as DataSyncSuccessfulMetadata}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
