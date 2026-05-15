export type IndexCard = {
  title: string
  description: string
  href: string
}

export const indexCards: readonly IndexCard[] = [
  {
    title: "Colors",
    description: "Every token resolved for the active theme.",
    href: "/sandbox/colors",
  },
  {
    title: "Typography",
    description: "Type ramp, tabular numbers, and radii.",
    href: "/sandbox/typography",
  },
  {
    title: "Forms",
    description: "Inputs, selectors, sliders, buttons.",
    href: "/sandbox/forms",
  },
  {
    title: "Surfaces",
    description: "Cards, alerts, badges, skeletons, separators, avatars.",
    href: "/sandbox/surfaces",
  },
  {
    title: "Navigation",
    description: "Tabs, accordion, breadcrumb, menubar.",
    href: "/sandbox/navigation",
  },
  {
    title: "Overlays",
    description: "Dialogs, sheets, popovers, menus, command palette.",
    href: "/sandbox/overlays",
  },
  {
    title: "Polish",
    description: "Motion, surfaces, hit areas, tabular numbers.",
    href: "/sandbox/polish",
  },
  {
    title: "All components",
    description: "The whole design system on one page.",
    href: "/sandbox/all",
  },
]
