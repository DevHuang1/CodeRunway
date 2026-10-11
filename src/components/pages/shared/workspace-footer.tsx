import Link from "next/link";

export function WorkspaceFooter() {
  return (
    <footer className="footer shell-width">
      <span>CodeRunway / safe sample workspace</span>
      <nav className="static-footer-nav" aria-label="Project pages">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms of Service</Link>
      </nav>
      <span>Progress is evidence, not pressure.</span>
    </footer>
  );
}
