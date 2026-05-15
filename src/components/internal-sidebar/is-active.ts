export function isInternalNavActive(href: string, pathname: string): boolean {
  if (href === "/sandbox") return pathname === "/sandbox"
  return pathname === href || pathname.startsWith(`${href}/`)
}
