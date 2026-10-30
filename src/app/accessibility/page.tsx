import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/legal/static-page";

export const metadata: Metadata = {
  title: "Accessibility — CodeRunway",
  description: "How CodeRunway supports keyboard use, readable contrast, reduced motion, and clear form labels.",
};

export default function AccessibilityPage() {
  return (
    <StaticPage eyebrow="ACCESSIBILITY" title="A workspace meant to stay navigable.">
      <section aria-labelledby="access-commitment">
        <h2 id="access-commitment">Our approach</h2>
        <p>
          CodeRunway is a small demonstration, not a formally audited product. Even so, the
          interface is built with semantic landmarks, visible focus, labeled controls, and honest
          status text so the sample path can be used with a keyboard and assistive technology.
        </p>
      </section>

      <section aria-labelledby="access-keyboard">
        <h2 id="access-keyboard">Keyboard and focus</h2>
        <ul>
          <li>A skip link moves focus directly to the main content.</li>
          <li>Links, buttons, form fields, tabs, and disclosures are reachable with the keyboard.</li>
          <li>Focus outlines use the teal accent and remain visible against both themes.</li>
          <li>The account menu closes with Escape and supports a normal tab order.</li>
        </ul>
      </section>

      <section aria-labelledby="access-forms">
        <h2 id="access-forms">Forms and feedback</h2>
        <p>
          The sign-in form has a labeled role selector and access-code field. The user demo code
          is exposed with a &ldquo;Fill&rdquo; button rather than hidden in helper text. Errors are
          announced with an alert region, and status changes in the workflow use a polite live
          region.
        </p>
      </section>

      <section aria-labelledby="access-visual">
        <h2 id="access-visual">Visual comfort</h2>
        <p>
          The site offers a light and dark theme, and the theme toggle is available on every page.
          The dark theme is stored in <code>localStorage</code> only as a display preference.
          Reduced-motion preferences disable non-essential transitions and animations.
        </p>
      </section>

      <section aria-labelledby="access-limits">
        <h2 id="access-limits">Known limitations</h2>
        <p>
          The sample has not been tested with every browser, screen reader, or input device. Some
          visual treatments rely on color and spacing alongside text labels and status messages.
          If you encounter a barrier, please report it through the{" "}
          <Link href="/contact">contact page</Link>. Reports are welcome even though this project
          does not offer a formal support agreement.
        </p>
      </section>

      <section aria-labelledby="access-standard">
        <h2 id="access-standard">Reference point</h2>
        <p>
          The interface is designed with the Web Content Accessibility Guidelines (WCAG) 2.2 in
          mind, but this page is not a claim of conformance. The honest description is that the
          project aims for accessible patterns and welcomes corrections.
        </p>
      </section>
    </StaticPage>
  );
}
