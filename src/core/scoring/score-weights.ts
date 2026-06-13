import type { ScoreWeights } from "../../shared/types/config";

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  complexityWeight: 0.25,
  maintainabilityWeight: 0.2,
  couplingWeight: 0.2,
  architectureWeight: 0.2,
  testabilityWeight: 0.15,
};
