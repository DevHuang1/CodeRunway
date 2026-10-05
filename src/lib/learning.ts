import { z } from "zod";

const learningNoteSchema = z.object({
  concept: z.string().min(1),
  whyItMatters: z.string().min(1),
  lookFor: z.string().min(1),
  reflectionQuestion: z.string().min(1),
});

const fileLearningSchema = z.object({
  concept: z.string().min(1),
  whyItMatters: z.string().min(1),
  lookFor: z.string().min(1),
});

const checkLearningSchema = z.object({
  proves: z.string().min(1),
  ifItFails: z.string().min(1),
});

export type LearningNote = z.infer<typeof learningNoteSchema>;
export type FileLearning = z.infer<typeof fileLearningSchema>;
export type CheckLearning = z.infer<typeof checkLearningSchema>;

function validateCatalog<T>(schema: z.ZodType<T>, catalog: Record<string, unknown>): Record<string, T> {
  return z.record(z.string(), schema).parse(catalog);
}

export const CHECKPOINT_LEARNING = validateCatalog(learningNoteSchema, {
  understand: {
    concept: "Translate a request into a user outcome.",
    whyItMatters: "A concrete outcome gives the change a boundary and makes later evidence easier to judge.",
    lookFor: "The issue names the user, the behavior, and what success should look like.",
    reflectionQuestion: "Could you describe success without naming a file or implementation detail?",
  },
  plan: {
    concept: "Break work into reviewable decisions.",
    whyItMatters: "Small checkpoints make it easier to notice when an agent is solving the wrong problem.",
    lookFor: "Each step has a clear purpose and an evidence statement you can inspect.",
    reflectionQuestion: "Which checkpoint would show you that the change is ready to review?",
  },
  generate: {
    concept: "Make the smallest focused edit.",
    whyItMatters: "A narrow change is easier to understand, test, and safely carry into a real project.",
    lookFor: "Only registered sample files change, and the edit directly supports the stated outcome.",
    reflectionQuestion: "What is the smallest part of this patch that addresses the issue?",
  },
  inspect: {
    concept: "Read code as a set of behavior decisions.",
    whyItMatters: "A diff is useful when you can explain what behavior it adds and what behavior it protects.",
    lookFor: "The changed lines connect the input, feedback, and submit behavior without unrelated work.",
    reflectionQuestion: "Which changed line makes weak input visible to the user?",
  },
  test: {
    concept: "Use static checks as limited evidence.",
    whyItMatters: "A content match is a quick signal, not proof that code compiles or behaves at runtime.",
    lookFor: "Each fixed criterion matches expected text or markup in the sample files; no program executes.",
    reflectionQuestion: "What would need to run in a real project to verify this behavior more fully?",
  },
  verify: {
    concept: "Connect proof back to the original outcome.",
    whyItMatters: "Completion is stronger when the diff, checks, and next step tell the same story.",
    lookFor: "All required checks pass, the changed files are known, and the next step is explicit.",
    reflectionQuestion: "Can you explain why this patch addresses the original request?",
  },
});

export const ISSUE_LEARNING = [
  "State-derived validation: use input to determine a clear, visible status.",
  "Accessible feedback: connect the field to help and error text for every user.",
  "Regression tests: preserve the expected behavior when the form changes later.",
];

export const FILE_LEARNING = validateCatalog(fileLearningSchema, {
  "src/signup.tsx": {
    concept: "State-derived validation and accessible feedback.",
    whyItMatters: "The form can explain its current state before submission and expose that explanation to assistive technology.",
    lookFor: "The password value drives strength, the field references its messages, and weak input disables submission.",
  },
  "src/signup.test.tsx": {
    concept: "A regression test for the user-visible behavior.",
    whyItMatters: "The fixture criterion looks for the expected message in a test file, but does not execute that test.",
    lookFor: "The test types weak input and checks for the same message the form renders.",
  },
});

export const CHECK_LEARNING = validateCatalog(checkLearningSchema, {
  "Accessible strength feedback": {
    proves: "The password field exposes its strength status and associates the field with its feedback.",
    ifItFails: "Inspect the input attributes and confirm the status and error identifiers are connected to the field.",
  },
  "Weak password guidance": {
    proves: "Weak input receives a visible, actionable minimum-length explanation.",
    ifItFails: "Check the strength threshold and the condition that renders the inline message.",
  },
  "Regression coverage": {
    proves: "The expected weak-password behavior is represented in a test rather than only in the implementation.",
    ifItFails: "Compare the test's typed input and expected message with the form's actual copy.",
  },
});

export function getCheckpointLearning(milestoneId: string): LearningNote {
  return CHECKPOINT_LEARNING[milestoneId] ?? CHECKPOINT_LEARNING.understand;
}

export function getFileLearning(path: string): FileLearning | null {
  return FILE_LEARNING[path] ?? null;
}

export function getCheckLearning(name: string): CheckLearning | null {
  return CHECK_LEARNING[name] ?? null;
}
