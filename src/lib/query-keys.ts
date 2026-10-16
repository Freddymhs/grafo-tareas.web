import type { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/lib/constants";

export type ListParams = {
  page?: typeof DEFAULT_PAGE | number;
  limit?: typeof DEFAULT_LIMIT | number;
};

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: ListParams) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
