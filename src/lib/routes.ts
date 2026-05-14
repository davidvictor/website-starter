import type { DevRoute } from "@/components/dev-panel/types"

export const devRoutes = [
  { path: "/", label: "Landing", group: "main" },
  {
    path: "/sandbox",
    label: "Sandbox",
    group: "main",
    description: "Design system reference — every component on the active theme",
  },
  {
    path: "/examples/motion",
    label: "Motion",
    group: "playground",
    description: "Motion (formerly Framer Motion) primitives",
  },
  {
    path: "/examples/shaders",
    label: "Shaders",
    group: "playground",
    description: "Paper Design shader playground",
  },
  {
    path: "/examples/blocks",
    label: "Blocks",
    group: "playground",
    description: "shadcn marketing blocks",
  },
  {
    path: "/login",
    label: "Login",
    group: "auth",
    description: "shadcn login-04 block",
  },
  {
    path: "/signup",
    label: "Signup",
    group: "auth",
    description: "shadcn signup-04 block",
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    group: "app",
    description: "shadcn dashboard-01 block",
  },
] as const satisfies readonly DevRoute[]

export type DevRoutePath = (typeof devRoutes)[number]["path"]
