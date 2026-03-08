"use client";

import { useEffect, useMemo, useRef } from "react";

interface Fixture {
  homeClub: string;
  awayClub: string;
  homeGoals?: number;
  awayGoals?: number;
}

interface Round {
  round: number;
  fixtures: Fixture[];
}

function pairFixtures<T>(fixtures: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < fixtures.length; i += 2) {
    pairs.push(fixtures.slice(i, i + 2));
  }
  return pairs;
}

function isPlayedFixture(fixture: Fixture): boolean {
  return (
    typeof fixture.homeGoals === "number" &&
    typeof fixture.awayGoals === "number"
  );
}

export function FixturesScrollPane({ rounds }: { rounds: Round[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);

  const targetRoundIndex = useMemo(() => {
    let lastPlayedRoundIndex = 0;

    rounds.forEach((round, index) => {
      if (round.fixtures.some(isPlayedFixture)) {
        lastPlayedRoundIndex = index;
      }
    });

    return lastPlayedRoundIndex;
  }, [rounds]);

  useEffect(() => {
    const container = containerRef.current;
    const marker = markerRef.current;
    if (!container || !marker) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const markerTop = marker.getBoundingClientRect().top;
    const nextScrollTop = Math.max(
      0,
      container.scrollTop + (markerTop - containerTop),
    );
    container.scrollTop = nextScrollTop;
  }, [targetRoundIndex]);

  return (
    <div
      ref={containerRef}
      className="mx-auto max-h-[36rem] w-full overflow-y-auto rounded-md border"
    >
      {rounds.map((round, roundIndex) => (
        <div key={`round-${round.round ?? roundIndex}`}>
          <div
            ref={roundIndex === targetRoundIndex ? markerRef : null}
            className="bg-muted/70 px-4 py-2.5 text-xs font-semibold tracking-wide"
          >
            Round {round.round ?? roundIndex + 1}
          </div>

          {pairFixtures(round.fixtures).map((fixturePair, pairIndex) => (
            <div
              key={`round-${roundIndex}-pair-${pairIndex}`}
              className="grid grid-cols-1 divide-y border-t md:grid-cols-2 md:divide-x md:divide-y-0 py-2"
            >
              {fixturePair.map((fixture, fixtureIndex) => {
                const hasScore = isPlayedFixture(fixture);

                return (
                  <div
                    key={`round-${roundIndex}-pair-${pairIndex}-fixture-${fixtureIndex}`}
                    className="px-4 py-3 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                        <span className="truncate font-medium">
                          {fixture.homeClub.replace(/_/g, " ")}
                        </span>
                        <span className="w-4 text-right font-semibold">
                          {hasScore ? fixture.homeGoals : "-"}
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                        <span className="truncate font-medium">
                          {fixture.awayClub.replace(/_/g, " ")}
                        </span>
                        <span className="w-4 text-right font-semibold">
                          {hasScore ? fixture.awayGoals : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {fixturePair.length === 1 && <div className="hidden md:block" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
