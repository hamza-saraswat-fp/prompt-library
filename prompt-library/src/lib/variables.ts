/**
 * Regex matching {{variable_name}} or {{variable_name | placeholder text}}.
 * Captures: group 1 = name, group 2 = placeholder (optional, trimmed).
 */
const VAR_RE = /\{\{(\w+)(?:\s*\|\s*([^}]*))?\}\}/g

/**
 * Extract {{variable_name}} or {{variable_name | placeholder}} from prompt text.
 * Returns unique variable names in order of first appearance.
 */
export function extractVariables(text: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const m of text.matchAll(VAR_RE)) {
    const name = m[1]
    if (!seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }
  return result
}

/**
 * Extract variables with their inline placeholder text.
 * Returns unique { name, placeholder } objects. First occurrence wins for placeholder.
 */
export function extractVariablesWithPlaceholders(
  text: string
): Array<{ name: string; placeholder: string }> {
  const seen = new Set<string>()
  const result: Array<{ name: string; placeholder: string }> = []
  for (const m of text.matchAll(VAR_RE)) {
    const name = m[1]
    if (!seen.has(name)) {
      seen.add(name)
      result.push({ name, placeholder: m[2]?.trim() ?? "" })
    }
  }
  return result
}

/**
 * Replace {{variable_name}} and {{variable_name | placeholder}} with provided values.
 * Unfilled variables are rendered as {{variable_name}} (placeholder stripped).
 */
export function fillVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(VAR_RE, (_, name: string) => {
    return values[name]?.trim() ? values[name] : `{{${name}}}`
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
 * Split text on {{variable}} / {{variable | placeholder}} boundaries for rendering.
 * Returns segments; variable segments have name only (placeholder stripped).
 */
export function segmentPromptText(
  text: string
): Array<{ text: string; isVariable: boolean; variableName?: string; key: string }> {
  const parts = text.split(/(\{\{\w+(?:\s*\|[^}]*)?\}\})/)
  return parts
    .filter((p) => p !== "")
    .map((part, i) => {
      const varMatch = part.match(/^\{\{(\w+)(?:\s*\|[^}]*)?\}\}$/)
      if (varMatch) {
        return {
          text: `{{${varMatch[1]}}}`,
          isVariable: true,
          variableName: varMatch[1],
          key: `seg-${i}-${varMatch[1]}`,
        }
      }
      return {
        text: part,
        isVariable: false,
        key: `seg-${i}-${part.slice(0, 8)}`,
      }
    })
}
