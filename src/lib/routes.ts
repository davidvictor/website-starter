import type { DevRoute } from "@/components/dev-panel/types"

/**
 * Non-composition dev routes. Block compositions live in
 * `src/lib/compositions.ts` and are surfaced in the dev panel as their
 * own "compositions" group, distinct from the routes below.
 */
export const devRoutes = [
  {
    path: "/sandbox",
    label: "Sandbox",
    group: "reference",
    description:
      "Design system reference — every component on the active theme.",
  },
  {
    path: "/variants",
    label: "All variants",
    group: "reference",
    description: "Side-by-side gallery of every composition × every block.",
  },
  {
    path: "/accessibility",
    label: "Accessibility",
    group: "reference",
    description: "WCAG 2.2 contrast audit for every theme × mode, on one page.",
  },
  {
    path: "/examples/motion",
    label: "Motion",
    group: "playground",
    description: "Motion (formerly Framer Motion) primitives.",
  },
  {
    path: "/examples/shaders",
    label: "Shaders",
    group: "playground",
    description: "Paper Design shader playground.",
  },
  {
    path: "/examples/blocks",
    label: "Blocks",
    group: "playground",
    description: "shadcn marketing blocks.",
  },
  {
    path: "/login",
    label: "Login",
    group: "auth",
    description: "shadcn login-04 block.",
  },
  {
    path: "/signup",
    label: "Signup",
    group: "auth",
    description: "shadcn signup-04 block.",
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    group: "app",
    description: "shadcn dashboard-01 block.",
  },
] as const satisfies readonly DevRoute[]

export type DevRoutePath = (typeof devRoutes)[number]["path"]
