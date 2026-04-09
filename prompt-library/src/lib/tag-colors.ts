const BLUE = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
const PURPLE = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"

export function createGetTagColor(departments: string[]) {
  const deptSet = new Set(departments)
  return (tag: string): string => deptSet.has(tag) ? BLUE : PURPLE
}

// Default fallback for components that don't have departments yet
let _getTagColor: (tag: string) => string = () => PURPLE

export function initTagColors(departments: string[]) {
  _getTagColor = createGetTagColor(departments)
}

export function getTagColor(tag: string): string {
  return _getTagColor(tag)
}
