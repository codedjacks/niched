export type TierId = "pencil" | "paperclip" | "notebook" | "backpack" | "goldstar" | "valedictorian";

export interface Tier {
  id: TierId;
  label: string;
  points: number;
  emoji: string;
}

export interface Question {
  id: string;
  prompt: string;
  category: string;
  /** canonical answer (normalized key) -> tier, plus alias map to canonical display names */
  answers: Map<string, { display: string; tier: TierId }>;
}

export type Outcome =
  | { kind: "correct"; display: string; tier: TierId; points: number }
  | { kind: "skipped"; points: 0 }
  | { kind: "timeout"; points: 0 };

export interface RoundAnswer {
  questionId: string;
  prompt: string;
  outcome: Outcome;
}

export type Mode = "daily" | "practice";
