import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  addWatchlistItem,
  listWatchlist,
  removeWatchlistItem,
  type WatchlistItem,
} from "@/lib/watchlistService";

export function useWatchlist() {
  const { user } = useAuth();

  return useQuery<WatchlistItem[]>({
    queryKey: ["watchlist", user?.id],
    queryFn: () => listWatchlist(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 30000,
  });
}

export function useToggleWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ isSaved, symbol }: { isSaved: boolean; symbol: string }) => {
      if (!user?.id) {
        throw new Error("You must be signed in to manage your watchlist.");
      }

      if (isSaved) {
        await removeWatchlistItem(user.id, symbol);
        return { action: "removed" as const, symbol };
      }

      await addWatchlistItem(user.id, symbol);
      return { action: "added" as const, symbol };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", user?.id] });
    },
  });
}
