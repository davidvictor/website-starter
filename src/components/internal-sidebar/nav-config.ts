export type InternalNavLink = {
  label: string
  href: string
}

export type InternalNavGroup = {
  label: string
  items: InternalNavLink[]
}

export const internalNav: readonly InternalNavGroup[] = [
  {
    label: "Design system",
    items: [
      { label: "Index", href: "/sandbox" },
      { label: "Colors", href: "/sandbox/colors" },
      { label: "Typography", href: "/sandbox/typography" },
      { label: "Forms", href: "/sandbox/forms" },
      { label: "Surfaces", href: "/sandbox/surfaces" },
      { label: "Navigation", href: "/sandbox/navigation" },
      { label: "Overlays", href: "/sandbox/overlays" },
      { label: "Polish", href: "/sandbox/polish" },
      { label: "All components", href: "/sandbox/all" },
    ],
  },
  {
    label: "Compositions",
    items: [{ label: "Variants", href: "/variants" }],
  },
  {
    label: "App templates",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Login", href: "/login" },
      { label: "Signup", href: "/signup" },
    ],
  },
  {
    label: "Examples",
    items: [
      { label: "Motion", href: "/examples/motion" },
      { label: "Shaders", href: "/examples/shaders" },
      { label: "Blocks", href: "/examples/blocks" },
    ],
  },
]
