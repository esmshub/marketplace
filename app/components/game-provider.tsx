"use client";

import { GameDto } from "@/lib/domain/game";
import { createContext, useContext, useState } from "react";

interface ContextProps {
  activeGame?: GameDto;
  games: GameDto[];
  setGameId?: (id: number) => void;
}
const GameContext = createContext<ContextProps>({ games: [] });

export function GameProvider({
  games,
  children,
}: {
  games: GameDto[];
  children: React.ReactNode;
}) {
  const [gameList, _] = useState(games);
  const [gameId, setGameId] = useState(gameList?.[0].id);

  const activeGame = gameList.find((g) => g.id === gameId);

  return (
    <GameContext.Provider value={{ games: gameList, activeGame, setGameId }}>
      {children}
    </GameContext.Provider>
  );
}

export const useActiveGame = () => {
  const context = useContext(GameContext);
  return [context.activeGame, context.setGameId] as const;
};

export const useGames = () => useContext(GameContext).games;
