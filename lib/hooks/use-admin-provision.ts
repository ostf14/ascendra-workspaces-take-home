"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { adminProvisionWorkspace } from "@/lib/api/fleet";
import type { AdminCreateWorkspaceRequest, VM } from "@/lib/domain/types";

import { adminKeys, workspacesKeys } from "./keys";

export function useAdminProvisionWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminCreateWorkspaceRequest) =>
      adminProvisionWorkspace(input),
    onSuccess: (workspace) => {
      queryClient.setQueryData(workspacesKeys.detail(workspace.id), workspace);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Could not provision workspace";
      toast.error(message);
    },
    onSettled: (data: VM | undefined) => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.fleet() });
      void queryClient.invalidateQueries({ queryKey: adminKeys.overview() });
      void queryClient.invalidateQueries({ queryKey: workspacesKeys.list() });
      if (data) {
        void queryClient.invalidateQueries({
          queryKey: workspacesKeys.detail(data.id),
        });
      }
    },
  });
}
