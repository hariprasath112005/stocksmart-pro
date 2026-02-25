import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanySettings } from "@/types/database";
import { toast } from "sonner";

const API_URL = "http://localhost:3000/api";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/settings`);
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json() as Promise<CompanySettings>;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: CompanySettings) => {
      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json() as Promise<CompanySettings>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully");
    },
  });
}
