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

function passwordStrength(password: string) {
  if (password.length >= 12 && /[A-Z]/.test(password) && /\\d/.test(password)) {
    return "strong";
  }
  if (password.length >= 8) return "medium";
  return "weak";
}

export function SignupForm() {
  const [password, setPassword] = useState("");
  const strength = passwordStrength(password);
  const hasError = password.length > 0 && strength === "weak";

  return (
    <form aria-label="Create an account">
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        aria-describedby="password-help password-error"
        aria-invalid={hasError}
        onChange={(event) => setPassword(event.target.value)}
      />
      <p id="password-help" role="status">Strength: {strength}</p>
      {hasError && <p id="password-error">Use at least 8 characters.</p>}
      <button type="submit" disabled={hasError || password.length === 0}>
        Create account
      </button>
    </form>
  );
}`;

const testBefore = `describe("SignupForm", () => {
  it("renders a password field", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});`;

const testAfter = `describe("SignupForm", () => {
  it("renders a password field", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("explains when a password is too short", async () => {
    render(<SignupForm />);
    await userEvent.type(screen.getByLabelText("Password"), "short");
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
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
