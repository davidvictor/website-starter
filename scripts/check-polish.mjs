#!/usr/bin/env node
/**
 * Polish system guardrails — warn-only by default.
 * See docs/UI_POLISH.md and docs/adr/.
 *
 * Run with: `pnpm check:polish`
 * Exits 0 even on findings — set `EXIT_CODE_ON_FINDINGS=1` to enforce.
 */

import { readFileSync } from "node:fs"
import { glob } from "node:fs/promises"

const EXIT_ON_FINDINGS = process.env.EXIT_CODE_ON_FINDINGS === "1"

/**
 * Per-line patterns. Each line is checked independently.
 */
const LINE_PATTERNS = [
  {
    name: "transition-all",
    description:
      "Use explicit property lists. See docs/UI_POLISH.md > Common mistakes.",
    regex: /\btransition-all\b/,
  },
  {
    name: "hardcoded shadow-md/lg/xl",
    description:
      "Use the shadow tokens: shadow-[var(--shadow-subtle)] / -raised / -overlay.",
    regex: /\bshadow-(md|lg|xl|2xl)\b(?![\w-])/,
    pathFilter: (p) =>
      !p.includes("/themes/") && !p.includes("/components/motion/"),
  },
  {
    name: "font-variant-numeric inline",
    description: "Prefer the `.tabular` utility class. See ADR 0004.",
    regex: /font-variant-numeric:\s*tabular-nums/,
  },
]

/**
 * Element-spanning checks — find an opening element across multiple lines.
 */
const ELEMENT_CHECKS = [
  {
    name: "raw <img>",
    description:
      "Add `image-outline` class for the canonical 1px outline. See ADR 0001.",
    open: /<img\b/,
    close: />/,
    requiredPattern: /\bimage-outline\b/,
    pathFilter: (p) =>
      !p.includes("/shaders/") &&
      !p.includes("favicon") &&
      !p.includes("/themes/"),
  },
]

async function main() {
  const targets = [
    "src/app/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
  ]

  const files = []
  for (const t of targets) {
    for await (const f of glob(t)) {
      files.push(f)
    }
  }

  let findings = 0

  for (const file of files) {
    const text = readFileSync(file, "utf-8")
    const lines = text.split("\n")

    for (const pattern of LINE_PATTERNS) {
      if (pattern.pathFilter && !pattern.pathFilter(file)) continue
      for (let i = 0; i < lines.length; i++) {
        if (pattern.regex.test(lines[i])) {
          findings++
          console.log(
            `${file}:${i + 1}  [${pattern.name}] ${pattern.description}`
          )
        }
      }
    }

    for (const check of ELEMENT_CHECKS) {
      if (check.pathFilter && !check.pathFilter(file)) continue
      for (let i = 0; i < lines.length; i++) {
        if (!check.open.test(lines[i])) continue
        // accumulate until we find a closing > on this or a later line
        let buf = lines[i]
        let j = i
        while (!check.close.test(buf) && j < lines.length - 1) {
          j++
          buf += "\n" + lines[j]
        }
        if (!check.requiredPattern.test(buf)) {
          findings++
          console.log(
            `${file}:${i + 1}  [${check.name}] ${check.description}`
          )
        }
      }
    }
  }

  if (findings === 0) {
    console.log("polish: clean")
    process.exit(0)
  }

  console.log(`\npolish: ${findings} finding(s)`)
  process.exit(EXIT_ON_FINDINGS ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(2)
})
