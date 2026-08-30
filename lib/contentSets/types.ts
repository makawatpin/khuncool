export const SHARE_TEMPLATES = ["random-question", "mystery-board"] as const;

export type ShareTemplate = (typeof SHARE_TEMPLATES)[number];

export type SharedContentSet = {
  slug: string;
  title: string;
  kind: "list";
  items: string[];
  default_template: ShareTemplate;
  template_config: Record<string, unknown>;
};

export function isShareTemplate(value: string): value is ShareTemplate {
  return SHARE_TEMPLATES.includes(value as ShareTemplate);
}
