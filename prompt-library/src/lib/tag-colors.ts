import { DEPARTMENTS } from "@/data/types"

const deptSet = new Set<string>(DEPARTMENTS)

export function getTagColor(tag: string): string {
  if (deptSet.has(tag)) {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
  }
  return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
}
