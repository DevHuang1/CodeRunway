import type { DemoTask, FixtureFile } from "@/lib/types";

const signupBefore = `import { useState } from "react";

export function SignupForm() {
  const [password, setPassword] = useState("");

  return (
    <form aria-label="Create an account">
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">Create account</button>
    </form>
  );
}`;

const signupAfter = `import { useState } from "react";

export function passwordStrength(password: string) {
  if (password.length >= 12 && /[A-Z]/.test(password) && /\\d/.test(password)) return "strong" as const;
  if (password.length >= 8) return "medium" as const;
  return "weak" as const;
}

export function PasswordFeedback({ password }: { password: string }) {
  const strength = passwordStrength(password);
  const hasError = password.length > 0 && strength === "weak";
  return (
    <>
      <p id="password-help" role="status">Strength: {strength}</p>
      {hasError ? <p id="password-error">Use at least 8 characters.</p> : null}
    </>
  );
}

export function SignupForm() {
  const [password, setPassword] = useState("");
  const hasError = password.length > 0 && passwordStrength(password) === "weak";
  return (
    <form aria-label="Create an account">
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        aria-describedby={hasError ? "password-help password-error" : "password-help"}
        aria-invalid={hasError}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordFeedback password={password} />
      <button type="submit" disabled={hasError || password.length === 0}>Create account</button>
    </form>
  );
}`;

const testBefore = `import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SignupForm } from "./signup";

describe("signup form", () => {
  it("renders a labeled password field", () => {
    expect(renderToStaticMarkup(<SignupForm />)).toContain('id="password"');
  });
});`;

const testAfter = `import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PasswordFeedback, SignupForm, passwordStrength } from "./signup";

describe("signup password guidance", () => {
  it("associates accessible feedback with the password field", () => {
    expect(renderToStaticMarkup(<SignupForm />)).toContain('aria-describedby="password-help"');
  });

  it("explains why short passwords are rejected", () => {
    expect(renderToStaticMarkup(<PasswordFeedback password="short" />)).toContain("Use at least 8 characters.");
  });

  it("classifies common password strengths", () => {
    expect(passwordStrength("short")).toBe("weak");
    expect(passwordStrength("password8")).toBe("medium");
    expect(passwordStrength("Password12345")).toBe("strong");
  });
});`;

const files: FixtureFile[] = [
  {
    path: "src/signup.tsx",
    language: "tsx",
    before: signupBefore,
    after: signupAfter,
  },
  {
    path: "src/signup.test.tsx",
    language: "tsx",
    before: testBefore,
    after: testAfter,
  },
];

export const DEMO_TASK: DemoTask = {
  id: "signup-validation",
  title: "Add password-strength validation",
  summary: "Make the signup form explain weak passwords before submission.",
  description:
    "Add accessible password-strength feedback to the sample signup form. Users should understand why a weak password is rejected, and the behavior must be covered by a test.",
  expectedOutcome:
    "A user sees password strength, receives an inline explanation for weak input, and cannot submit until the password meets the minimum requirement.",
  stack: ["Next.js", "React", "TypeScript", "Vitest"],
  files,
};

export const DEMO_TASKS: DemoTask[] = [DEMO_TASK];

export function getDemoTask(taskId: string): DemoTask | undefined {
  return DEMO_TASKS.find((task) => task.id === taskId);
}

export function getAllowedPaths(task: DemoTask): Set<string> {
  return new Set(task.files.map((file) => file.path));
}
