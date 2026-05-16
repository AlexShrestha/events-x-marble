export type CandidateKind = "telegram" | "website";

export interface SourceCandidate {
  name: string;
  kind: CandidateKind;
  url: string;
  language: string;
  rationale: string;
  confidence: number;
}

export interface VerifiedCandidate extends SourceCandidate {
  verified: boolean;
  verify_error?: string;
}

export interface ScoutResult {
  ok: boolean;
  candidates: SourceCandidate[];
  raw_output: string;
  error?: string;
  elapsed_ms: number;
}
