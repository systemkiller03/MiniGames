import { apiClient } from '@/shared/api/api-client';

export type ApiLeaderboardPlayer = {
    rank: number;
    playerName: string;
    gamesPlayed: number;
    totalScore: number;
    streakDays: number;
    favoriteGameName: string;
};

type LeaderboardResponse = {
    data?: ApiLeaderboardPlayer[];
};

export async function getLeaderboardPlayers(): Promise<ApiLeaderboardPlayer[]> {
    const response = await apiClient<LeaderboardResponse>('/leaderboard');
    return response.data ?? [];
}
