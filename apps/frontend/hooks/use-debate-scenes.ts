import { useMemo } from 'react';

export interface Scene {
  id: string;
  type: 'intro' | 'round-title' | 'arguments' | 'analysis' | 'judging' | 'winner';
  data: any;
  duration: number; // ms to show this scene
}

interface DebateData {
  topic: string;
  research?: any[];
  rounds?: any[];
  judging?: any;
  winner?: any;
}

export function useDebateScenes(debateData: DebateData): Scene[] {
  const scenes = useMemo(() => {
    const sceneList: Scene[] = [];

    // Intro scene
    sceneList.push({
      id: 'intro',
      type: 'intro',
      data: { topic: debateData.topic },
      duration: 3000,
    });

    // Round scenes (skip research - go straight to arguments)
    if (debateData.rounds && debateData.rounds.length > 0) {
      debateData.rounds.forEach((round, roundIdx) => {
        // Round title
        sceneList.push({
          id: `round-${roundIdx}-title`,
          type: 'round-title',
          data: { roundNumber: round.roundNumber },
          duration: 2500,
        });

        // Both arguments together (side-by-side)
        if (round.arguments && round.arguments.length > 0) {
          sceneList.push({
            id: `round-${roundIdx}-arguments`,
            type: 'arguments',
            data: {
              roundNumber: round.roundNumber,
              arguments: round.arguments,
            },
            duration: 8000, // Longer duration to read both arguments
          });
        }

        // Analysis (combine moderator + fact check into one scene)
        if (round.moderation || round.factChecks) {
          sceneList.push({
            id: `round-${roundIdx}-analysis`,
            type: 'analysis',
            data: {
              moderation: round.moderation,
              factChecks: round.factChecks,
            },
            duration: 5000,
          });
        }
      });
    }

    // Judging scenes
    if (debateData.judging?.judges && debateData.judging.judges.length > 0) {
      debateData.judging.judges.forEach((judge: any, i: number) => {
        sceneList.push({
          id: `judge-${i}`,
          type: 'judging',
          data: judge,
          duration: 4000,
        });
      });
    }

    // Winner
    if (debateData.winner) {
      sceneList.push({
        id: 'winner',
        type: 'winner',
        data: debateData.winner,
        duration: 8000,
      });
    }

    return sceneList;
  }, [debateData]);

  return scenes;
}
