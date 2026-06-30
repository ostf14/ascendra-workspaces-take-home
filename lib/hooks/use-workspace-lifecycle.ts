"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import {
  createWorkspace,
  deleteWorkspace,
  restartWorkspace,
  startWorkspace,
  stopWorkspace,
} from "@/lib/api/workspaces";
import type {
  CreateWorkspaceRequest,
  VM,
  VMStatus,
} from "@/lib/domain/types";
import {
  clearTransition,
  markTransitionStarted,
} from "@/lib/transition-tracker";

import { adminKeys, workspacesKeys } from "./keys";

type LifecycleContext = {
  previousList: VM[] | undefined;
  previousDetail: VM | undefined;
};

function applyOptimisticStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  next: VMStatus
): LifecycleContext {
  const previousList = queryClient.getQueryData<VM[]>(workspacesKeys.list());
  const previousDetail = queryClient.getQueryData<VM>(workspacesKeys.detail(id));

  if (previousList) {
    queryClient.setQueryData<VM[]>(
      workspacesKeys.list(),
      previousList.map((w) => (w.id === id ? { ...w, status: next } : w))
    );
  }
  if (previousDetail) {
    queryClient.setQueryData<VM>(workspacesKeys.detail(id), {
      ...previousDetail,
      status: next,
    });
  }

  return { previousList, previousDetail };
}

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  context: LifecycleContext | undefined
): void {
  if (!context) return;
  if (context.previousList !== undefined) {
    queryClient.setQueryData(workspacesKeys.list(), context.previousList);
  }
  if (context.previousDetail !== undefined) {
    queryClient.setQueryData(workspacesKeys.detail(id), context.previousDetail);
  }
}

function invalidate(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string
): void {
  void queryClient.invalidateQueries({ queryKey: workspacesKeys.list() });
  void queryClient.invalidateQueries({ queryKey: adminKeys.fleet() });
  void queryClient.invalidateQueries({ queryKey: adminKeys.overview() });
  if (id) {
    void queryClient.invalidateQueries({ queryKey: workspacesKeys.detail(id) });
  }
}

function reportError(error: unknown, fallback: string): void {
  const message = error instanceof ApiError ? error.message : fallback;
  toast.error(message);
}

export function useStartWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => startWorkspace(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workspacesKeys.list() });
      await queryClient.cancelQueries({ queryKey: workspacesKeys.detail(id) });
      markTransitionStarted(id);
      return applyOptimisticStatus(queryClient, id, "starting");
    },
    onError: (error, id, context) => {
      rollback(queryClient, id, context);
      clearTransition(id);
      reportError(error, "Could not start workspace");
    },
    onSettled: (_data, _error, id) => invalidate(queryClient, id),
  });
}

export function useStopWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stopWorkspace(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workspacesKeys.list() });
      await queryClient.cancelQueries({ queryKey: workspacesKeys.detail(id) });
      markTransitionStarted(id);
      return applyOptimisticStatus(queryClient, id, "stopping");
    },
    onError: (error, id, context) => {
      rollback(queryClient, id, context);
      clearTransition(id);
      reportError(error, "Could not stop workspace");
    },
    onSettled: (_data, _error, id) => invalidate(queryClient, id),
  });
}

export function useRestartWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restartWorkspace(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workspacesKeys.list() });
      await queryClient.cancelQueries({ queryKey: workspacesKeys.detail(id) });
      markTransitionStarted(id);
      return applyOptimisticStatus(queryClient, id, "starting");
    },
    onError: (error, id, context) => {
      rollback(queryClient, id, context);
      reportError(error, "Could not restart workspace");
    },
    onSettled: (_data, _error, id) => invalidate(queryClient, id),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: workspacesKeys.list() });
      const previousList = queryClient.getQueryData<VM[]>(workspacesKeys.list());
      const previousDetail = queryClient.getQueryData<VM>(workspacesKeys.detail(id));
      if (previousList) {
        queryClient.setQueryData<VM[]>(
          workspacesKeys.list(),
          previousList.filter((w) => w.id !== id)
        );
      }
      return { previousList, previousDetail } satisfies LifecycleContext;
    },
    onError: (error, id, context) => {
      rollback(queryClient, id, context);
      reportError(error, "Could not delete workspace");
    },
    onSettled: (_data, _error, id) => invalidate(queryClient, id),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkspaceRequest) => createWorkspace(input),
    onSuccess: (workspace) => {
      queryClient.setQueryData<VM[]>(workspacesKeys.list(), (prev) =>
        prev ? [workspace, ...prev] : [workspace]
      );
      queryClient.setQueryData(workspacesKeys.detail(workspace.id), workspace);
      markTransitionStarted(workspace.id);
    },
    onError: (error) => reportError(error, "Could not create workspace"),
    onSettled: () => invalidate(queryClient),
  });
}
