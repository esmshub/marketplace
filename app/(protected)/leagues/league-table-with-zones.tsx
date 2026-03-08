"use client";

import { Fragment, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type LeagueTableRow = {
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
};

type ZoneSeparator = {
  afterPosition: number;
  label: string;
  colorClass: string;
};

export interface LeagueZoneConfig {
  promotionLine?: number;
  playoffLine?: number;
  relegationStart?: number;
}

function parseLinePosition(value: number | undefined, maxPosition: number): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(1, Math.min(maxPosition, parsed));
}

export function LeagueTableWithZones({
  rows,
  zones,
}: {
  rows: LeagueTableRow[];
  zones?: LeagueZoneConfig;
}) {
  const separatorsByPosition = useMemo(() => {
    const maxPosition = rows.length;
    const separators: ZoneSeparator[] = [];

    const promotion = parseLinePosition(zones?.promotionLine, maxPosition);
    if (promotion !== null) {
      separators.push({
        afterPosition: promotion,
        label: "Promotion",
        colorClass: "bg-emerald-500",
      });
    }

    const playoff = parseLinePosition(zones?.playoffLine, maxPosition);
    if (playoff !== null) {
      separators.push({
        afterPosition: playoff,
        label: "Play-off",
        colorClass: "bg-amber-500",
      });
    }

    const relegation = parseLinePosition(zones?.relegationStart, maxPosition);
    if (relegation !== null && relegation > 1) {
      separators.push({
        afterPosition: relegation - 1,
        label: "Relegation",
        colorClass: "bg-red-500",
      });
    }

    return separators.reduce<Record<number, ZoneSeparator[]>>((acc, separator) => {
      if (!acc[separator.afterPosition]) {
        acc[separator.afterPosition] = [];
      }
      acc[separator.afterPosition].push(separator);
      return acc;
    }, {});
  }, [rows.length, zones?.playoffLine, zones?.promotionLine, zones?.relegationStart]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Club</TableHead>
            <TableHead>P</TableHead>
            <TableHead>W</TableHead>
            <TableHead>D</TableHead>
            <TableHead>L</TableHead>
            <TableHead>GF</TableHead>
            <TableHead>GA</TableHead>
            <TableHead>GD</TableHead>
            <TableHead>Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const position = index + 1;
            const goalDifference = row.gf - row.ga;
            const points = row.won * 3 + row.drawn;
            const separators = separatorsByPosition[position] ?? [];

            return (
              <Fragment key={`table-block-${row.clubName}-${index}`}>
                <TableRow key={`table-row-${row.clubName}-${index}`}>
                  <TableCell>{position}</TableCell>
                  <TableCell>{row.clubName.replace(/_/g, " ")}</TableCell>
                  <TableCell>{row.played}</TableCell>
                  <TableCell>{row.won}</TableCell>
                  <TableCell>{row.drawn}</TableCell>
                  <TableCell>{row.lost}</TableCell>
                  <TableCell>{row.gf}</TableCell>
                  <TableCell>{row.ga}</TableCell>
                  <TableCell>{goalDifference}</TableCell>
                  <TableCell>{points}</TableCell>
                </TableRow>

                {separators.length > 0 && (
                  <TableRow key={`table-separator-${row.clubName}-${index}`}>
                    <TableCell colSpan={10} className="py-1">
                      <div className="space-y-1">
                        {separators.map((separator, separatorIndex) => (
                          <div
                            key={`separator-${position}-${separator.label}-${separatorIndex}`}
                            className="flex items-center gap-2"
                          >
                            <div className={`h-0.5 flex-1 rounded ${separator.colorClass}`} />
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {separator.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
