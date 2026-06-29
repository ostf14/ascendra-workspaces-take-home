"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createTemplate,
  fetchTemplate,
  fetchTemplates,
  updateTemplate,
} from "@/lib/api/templates";
import { ApiError } from "@/lib/api/client";
import type {
  CreateTemplateRequest,
  TemplateWithUsage,
  UpdateTemplateRequest,
} from "@/lib/domain/types";

import { adminKeys } from "./keys";

export function useTemplates() {
  return useQuery({
    queryKey: adminKeys.templates(),
    queryFn: ({ signal }) => fetchTemplates(signal),
    staleTime: 60_000,
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: id ? adminKeys.template(id) : ["admin", "templates", "__none__"],
    queryFn: ({ signal }) => {
      if (!id) throw new Error("Template id missing");
      return fetchTemplate(id, signal);
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTemplateRequest) => createTemplate(input),
    onSuccess: (template) => {
      queryClient.setQueryData<TemplateWithUsage[]>(
        adminKeys.templates(),
        (prev) => (prev ? [template, ...prev] : [template])
      );
      queryClient.setQueryData(adminKeys.template(template.id), template);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Could not create template";
      toast.error(message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.templates() });
    },
  });
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateTemplateRequest) => updateTemplate(id, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.template(id) });
      await queryClient.cancelQueries({ queryKey: adminKeys.templates() });
      const previousDetail = queryClient.getQueryData<TemplateWithUsage>(
        adminKeys.template(id)
      );
      const previousList = queryClient.getQueryData<TemplateWithUsage[]>(
        adminKeys.templates()
      );
      if (previousDetail) {
        const next: TemplateWithUsage = { ...previousDetail, ...patch };
        queryClient.setQueryData(adminKeys.template(id), next);
        if (previousList) {
          queryClient.setQueryData(
            adminKeys.templates(),
            previousList.map((t) => (t.id === id ? next : t))
          );
        }
      }
      return { previousDetail, previousList };
    },
    onError: (error, _patch, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(adminKeys.template(id), context.previousDetail);
      }
      if (context?.previousList) {
        queryClient.setQueryData(adminKeys.templates(), context.previousList);
      }
      const message =
        error instanceof ApiError ? error.message : "Could not update template";
      toast.error(message);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.templates() });
      void queryClient.invalidateQueries({ queryKey: adminKeys.template(id) });
    },
  });
}
