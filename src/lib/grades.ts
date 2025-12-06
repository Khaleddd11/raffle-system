export const GRADES = [
  "Pre-K",
  "Kindergarten",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
] as const;

export type Grade = (typeof GRADES)[number];

