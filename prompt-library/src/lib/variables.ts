/**
 * Extract {{variable_name}} placeholders from prompt text.
 * Returns unique variable names in order of first appearance.
 */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g)
  if (!matches) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const match of matches) {
    const name = match.slice(2, -2)
    if (!seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }
  return result
}

/**
 * Replace {{variable_name}} placeholders with provided values.
 * Unfilled variables remain as {{variable_name}}.
 */
export function fillVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    return values[name]?.trim() ? values[name] : match
  })
}

/**
 * Convert a variable name like "customer_name" to a human-readable label "Customer Name".
 */
export function variableToLabel(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Split text on {{variable}} boundaries into segments for rendering.
 * Returns an array of { text, isVariable } objects.
 */
export function segmentPromptText(
  text: string
): Array<{ text: string; isVariable: boolean; key: string }> {
  const parts = text.split(/(\{\{\w+\}\})/)
  return parts
    .filter((p) => p !== "")
    .map((part, i) => ({
      text: part,
      isVariable: /^\{\{\w+\}\}$/.test(part),
      key: `seg-${i}-${part.slice(0, 8)}`,
    }))
}
