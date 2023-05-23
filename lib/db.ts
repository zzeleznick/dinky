export enum Key {
  OriginalLink = "original",
  Hostname = "hostname",
  Shortcode = "shortcode",
  ShortcodeByUser = "shortcode_user",
  Visitor = "visitor",
  VisitorSum = "visitors",
  VisitSum = "visits",
}

export interface LinkDatum {
  value: string;
  user: string;
  shortcode: string;
  createdTs: number;
}

export type LinkDatumWithKey = LinkDatum & { key: string };

export const DB = await Deno.openKv();
