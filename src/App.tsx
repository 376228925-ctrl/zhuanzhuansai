import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { PlayersView } from './components/PlayersView';
import { ScheduleView } from './components/ScheduleView';
import { ScoreSheet } from './components/ScoreSheet';
import { SetupView } from './components/SetupView';
import { StandingsView } from './components/StandingsView';
import { TopNav } from './components/TopNav';
import { WeChatReportModal } from './components/WeChatReportModal';
import {
  createDemoTournament,
  loadTournamentState,
  saveTournamentState,
} from './data/demoTournament';
import type {
  AppTab,
  Gender,
  Match,
  ParsedPlayerInput,
  Player,
  TournamentConfig,
  TournamentState,
} from './types/tournament';
import {
  analyzeScheduleFairness,
  calculateStandings,
  generateNextMexicanoRound,
  generateSmartSchedule,
  getRecommendedRounds,
  rescheduleRemainingRounds,
  swapPlayersInRound,
} from './utils/scheduler';

function findDefaultActiveRound(state: TournamentState): number {
  const firstPending = state.rounds.find((r) =>
    r.matches.some((m) => m.status !== 'completed')
  );
  return firstPending?.roundNumber ?? state.rounds[state.rounds.length - 1]?.roundNumber ?? 1;
}

export default function App() {
  const [state, setState] = useState<TournamentState>(() => loadTournamentState());
  const [activeTab, setActiveTab] = useState<AppTab>('schedule');
  const [activeRoundNumber, setActiveRoundNumber] = useState<number>(() =>
    findDefaultActiveRound(loadTournamentState())
  );
  const [scoringMatchId, setScoringMatchId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveTournamentState(state);
  }, [state]);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const standings = useMemo(
    () => calculateStandings(state.players, state.rounds),
    [state.players, state.rounds]
  );

  const fairness = useMemo(
    () => analyzeScheduleFairness(state.players, state.rounds),
    [state.players, state.rounds]
  );

  const playerMap = useMemo(() => {
    const map = new Map<string, Player>();
    state.players.forEach((p) => map.set(p.id, p));
    return map;
  }, [state.players]);

  const playedCountByPlayer = useMemo(() => {
    const map = new Map<string, number>();
    standings.forEach((s) => map.set(s.player.id, s.played));
    return map;
  }, [standings]);

  const totalMatches = useMemo(
    () => state.rounds.reduce((sum, r) => sum + r.matches.length, 0),
    [state.rounds]
  );

  const completedMatches = useMemo(
    () =>
      state.rounds.reduce(
        (sum, r) => sum + r.matches.filter((m) => m.status === 'completed').length,
        0
      ),
    [state.rounds]
  );

  const scoringMatch: Match | null = useMemo(() => {
    if (!scoringMatchId) return null;
    for (const round of state.rounds) {
      const found = round.matches.find((m) => m.id === scoringMatchId);
      if (found) return found;
    }
    return null;
  }, [scoringMatchId, state.rounds]);

  const handleSaveScore = useCallback(
    (matchId: string, scoreA: number, scoreB: number) => {
      setState((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        rounds: prev.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  scoreA,
                  scoreB,
                  status: 'completed',
                  completedAt: Date.now(),
                }
              : m
          ),
        })),
      }));
      showToast(`比分已记录：${scoreA} : ${scoreB}`);
    },
    [showToast]
  );

  const handleClearScore = useCallback(
    (matchId: string) => {
      setState((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        rounds: prev.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  scoreA: null,
                  scoreB: null,
                  status: 'pending',
                  completedAt: undefined,
                }
              : m
          ),
        })),
      }));
      showToast('已清除该场比分');
    },
    [showToast]
  );

  const handleSwapPlayers = useCallback(
    (roundNumber: number, playerIdA: string, playerIdB: string) => {
      setState((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        rounds: prev.rounds.map((round) =>
          round.roundNumber === roundNumber
            ? swapPlayersInRound(round, playerIdA, playerIdB)
            : round
        ),
      }));
      const nameA = playerMap.get(playerIdA)?.name ?? '';
      const nameB = playerMap.get(playerIdB)?.name ?? '';
      showToast(`已互换 ${nameA} 与 ${nameB} 的位置`);
    },
    [playerMap, showToast]
  );

  const handleGenerateNextMexicano = useCallback(() => {
    setState((prev) => {
      const nextRound = generateNextMexicanoRound(
        prev.players,
        prev.rounds,
        prev.config,
        prev.seed
      );
      setActiveRoundNumber(nextRound.roundNumber);
      return {
        ...prev,
        updatedAt: Date.now(),
        rosterDirty: false,
        rounds: [...prev.rounds, nextRound],
      };
    });
    showToast('已按实时积分生成下一轮升场对阵');
  }, [showToast]);

  const handleRescheduleRemaining = useCallback(() => {
    setState((prev) => {
      const next = rescheduleRemainingRounds(prev);
      setActiveRoundNumber(findDefaultActiveRound(next));
      return next;
    });
    showToast('已保留完赛记录并智能重排后续轮次');
  }, [showToast]);

  const handleAddPlayer = useCallback(
    (input: ParsedPlayerInput) => {
      setState((prev) => {
        const nextRoundJoined =
          prev.rounds.filter((r) => r.matches.some((m) => m.status === 'completed')).length + 1;
        const newPlayer: Player = {
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: input.name,
          gender: input.gender,
          rating: input.rating,
          active: true,
          joinedRound: nextRoundJoined,
        };
        return {
          ...prev,
          updatedAt: Date.now(),
          players: [...prev.players, newPlayer],
          rosterDirty: true,
        };
      });
      showToast(`已加入球友「${input.name}」，可点击智能重排生效`);
    },
    [showToast]
  );

  const handleImportPlayers = useCallback(
    (inputs: ParsedPlayerInput[], mode: 'append' | 'replace') => {
      if (inputs.length === 0) return;

      if (mode === 'replace') {
        const newPlayers: Player[] = inputs.map((item, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          name: item.name,
          gender: item.gender,
          rating: item.rating,
          active: true,
          joinedRound: 1,
        }));

        setState((prev) => {
          const maxCourts = Math.max(1, Math.min(prev.config.courtCount, Math.floor(newPlayers.length / 4) || 1));
          const recommended = getRecommendedRounds(newPlayers.length, maxCourts);
          const nextConfig: TournamentConfig = {
            ...prev.config,
            courtCount: maxCourts,
            totalRounds: recommended,
          };
          const nextSeed = prev.seed + 13;
          const nextRounds = generateSmartSchedule(newPlayers, nextConfig, nextSeed);
          setActiveRoundNumber(1);
          return {
            ...prev,
            seed: nextSeed,
            updatedAt: Date.now(),
            config: nextConfig,
            players: newPlayers,
            rounds: nextRounds,
            rosterDirty: false,
          };
        });
        showToast(`已导入 ${inputs.length} 位球友并重新生成赛程`);
        return;
      }

      // Append mode
      setState((prev) => {
        const existingNames = new Set(prev.players.map((p) => p.name.toLowerCase()));
        const nextRoundJoined =
          prev.rounds.filter((r) => r.matches.some((m) => m.status === 'completed')).length + 1;
        const additions: Player[] = inputs
          .filter((item) => !existingNames.has(item.name.toLowerCase()))
          .map((item, idx) => ({
            id: `imp-${Date.now()}-${idx}`,
            name: item.name,
            gender: item.gender,
            rating: item.rating,
            active: true,
            joinedRound: nextRoundJoined,
          }));

        if (additions.length === 0) {
          showToast('导入名单中的球友均已在当前名单中');
          return prev;
        }

        showToast(`已追加 ${additions.length} 位球友，可点击智能重排生效`);
        return {
          ...prev,
          updatedAt: Date.now(),
          players: [...prev.players, ...additions],
          rosterDirty: true,
        };
      });
    },
    [showToast]
  );

  const handleToggleActive = useCallback(
    (playerId: string) => {
      setState((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        rosterDirty: true,
        players: prev.players.map((p) =>
          p.id === playerId ? { ...p, active: !p.active } : p
        ),
      }));
    },
    []
  );

  const handleUpdateRating = useCallback((playerId: string, nextRating: number) => {
    setState((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, rating: nextRating } : p
      ),
    }));
  }, []);

  const handleUpdateGender = useCallback((playerId: string, gender: Gender) => {
    setState((prev) => ({
      ...prev,
      updatedAt: Date.now(),
      players: prev.players.map((p) => (p.id === playerId ? { ...p, gender } : p)),
    }));
  }, []);

  const handleRemovePlayer = useCallback(
    (playerId: string) => {
      setState((prev) => ({
        ...prev,
        updatedAt: Date.now(),
        rosterDirty: true,
        players: prev.players.filter((p) => p.id !== playerId),
      }));
      showToast('已移除球友');
    },
    [showToast]
  );

  const handleApplyConfigAndGenerate = useCallback(
    (nextConfig: TournamentConfig) => {
      setState((prev) => {
        const nextSeed = prev.seed + 29;
        const nextRounds = generateSmartSchedule(prev.players, nextConfig, nextSeed);
        return {
          ...prev,
          seed: nextSeed,
          updatedAt: Date.now(),
          config: nextConfig,
          rounds: nextRounds,
          rosterDirty: false,
        };
      });
      setActiveRoundNumber(1);
      setActiveTab('schedule');
      showToast('已按新赛制生成智能赛程');
    },
    [showToast]
  );

  const handleShuffleSchedule = useCallback(() => {
    setState((prev) => {
      const next = rescheduleRemainingRounds(prev);
      return next;
    });
    setActiveTab('schedule');
    showToast('已为你换一套高公平度排阵方案');
  }, [showToast]);

  const handleResetDemo = useCallback(() => {
    const fresh = createDemoTournament();
    setState(fresh);
    setActiveRoundNumber(findDefaultActiveRound(fresh));
    setActiveTab('schedule');
    showToast('已恢复默认示例赛事');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#111816] flex flex-col">
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReport={() => setReportOpen(true)}
        rosterDirty={state.rosterDirty}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-24 md:pb-12">
        {activeTab === 'schedule' && (
          <ScheduleView
            state={state}
            standings={standings}
            fairness={fairness}
            activeRoundNumber={activeRoundNumber}
            onSelectRound={setActiveRoundNumber}
            onOpenScore={(match) => setScoringMatchId(match.id)}
            onSwapPlayers={handleSwapPlayers}
            onGenerateNextMexicano={handleGenerateNextMexicano}
            onRescheduleRemaining={handleRescheduleRemaining}
            onGoToStandings={() => setActiveTab('standings')}
            onGoToPlayers={() => setActiveTab('players')}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsView
            standings={standings}
            completedMatches={completedMatches}
            totalMatches={totalMatches}
            onOpenReport={() => setReportOpen(true)}
          />
        )}

        {activeTab === 'players' && (
          <PlayersView
            players={state.players}
            playedCountByPlayer={playedCountByPlayer}
            rosterDirty={state.rosterDirty}
            onAddPlayer={handleAddPlayer}
            onImportPlayers={handleImportPlayers}
            onToggleActive={handleToggleActive}
            onUpdateRating={handleUpdateRating}
            onUpdateGender={handleUpdateGender}
            onRemovePlayer={handleRemovePlayer}
            onRescheduleRemaining={handleRescheduleRemaining}
          />
        )}

        {activeTab === 'setup' && (
          <SetupView
            state={state}
            fairness={fairness}
            onApplyConfigAndGenerate={handleApplyConfigAndGenerate}
            onShuffleSchedule={handleShuffleSchedule}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        rosterDirty={state.rosterDirty}
      />

      {/* Interactive Bottom Sheets / Modals */}
      <ScoreSheet
        match={scoringMatch}
        playerMap={playerMap}
        targetScore={state.config.targetScore}
        winByTwo={state.config.winByTwo}
        onClose={() => setScoringMatchId(null)}
        onSaveScore={handleSaveScore}
        onClearScore={handleClearScore}
      />

      <WeChatReportModal
        open={reportOpen}
        state={state}
        standings={standings}
        onClose={() => setReportOpen(false)}
      />

      {/* Accessible Non-Blocking Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#142621] text-white text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
