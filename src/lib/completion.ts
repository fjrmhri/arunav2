import type { CompletionLog } from "@/types";

export function filterValidTaskIds(taskIds: string[], validTaskIds: string[]) {
  const validSet = new Set(validTaskIds);
  return taskIds.filter((taskId) => validSet.has(taskId));
}

export function sanitizeCompletionLog(
  log: CompletionLog,
  validTaskIds: string[],
): CompletionLog {
  return {
    ...log,
    completedTaskIds: filterValidTaskIds(log.completedTaskIds, validTaskIds),
    skippedTaskIds: filterValidTaskIds(log.skippedTaskIds, validTaskIds),
  };
}
