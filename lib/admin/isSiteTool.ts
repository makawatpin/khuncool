/** tool_events also carries the เลี้ยงกาแฟ strip's view and sheet-open
 *  events ("support-strip", "support-sheet"). They are not tools, and the
 *  strip sits on the busiest page, so counting them would push a non-tool to
 *  the top of "เครื่องมือยอดนิยม". */
export function isSiteTool(tool: string): boolean {
  return !tool.startsWith("support-");
}
