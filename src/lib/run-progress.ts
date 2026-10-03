export function shouldAcceptMilestoneEvidence(completedCount: number, verifiedCount: number) {
  return completedCount > verifiedCount;
}

export function mergeVerifiedCheckpointCount(currentCount: number, completedCount: number) {
  return Math.max(currentCount, completedCount);
}

export function mergeEvidenceProgress(currentProgress: number, eventProgress: number) {
  return Math.max(currentProgress, Math.min(100, Math.max(0, eventProgress)));
}
