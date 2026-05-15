"use client"

import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { SPRING_MACRO } from "@/components/motion/springs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { runtime } from "@/config/runtime"
import { cn } from "@/lib/utils"

import { useDevPanel } from "./dev-panel-provider"
import { ControlsTab } from "./tabs/controls-tab"
import { DataTab } from "./tabs/data-tab"
import { NavTab } from "./tabs/nav-tab"
import { ThemesTab } from "./tabs/themes-tab"

export function DevPanel() {
  if (!runtime.isDevelopment) return null
  return <DevPanelInner />
}

function DevPanelInner() {
  const { open, setOpen, activeTab, setActiveTab } = useDevPanel()

  return (
    <>
      {/* Edge handle — visible when panel is closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            aria-label="Open dev panel (press ~)"
            onClick={() => setOpen(true)}
            data-touch
            data-motion="macro"
            initial={{ x: "100%", y: "-50%" }}
            animate={{ x: 0, y: "-50%" }}
            exit={{ x: "100%", y: "-50%" }}
            transition={SPRING_MACRO}
            className={cn(
              "fixed top-1/2 right-0 z-[9998] rounded-l-md border border-r-0 border-border bg-card/90 px-1.5 py-3 backdrop-blur-md transition-[background-color] cursor-pointer",
              "hover:bg-muted"
            )}
          >
            <span className="flex flex-col items-center gap-1.5">
              <span className="size-1 rounded-full bg-foreground/40" />
              <span className="size-1 rounded-full bg-foreground/40" />
              <span className="size-1 rounded-full bg-foreground/40" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* The sheet itself */}
      <AnimatePresence>
        {open && (
          <motion.aside
            data-state="open"
            data-motion="macro"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={SPRING_MACRO}
            className={cn(
              "fixed inset-y-0 right-0 z-[9999] flex w-full max-w-[380px] flex-col border-l border-border bg-card/95 text-card-foreground shadow-[var(--shadow-overlay)] backdrop-blur-md"
            )}
            aria-label="Dev panel"
          >
            <header className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/40 px-2.5">
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-tight">
                <span className="size-1.5 rounded-full bg-success" />
                dev
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <kbd className="rounded border border-border bg-background px-1 py-px font-mono text-[9px] leading-none">
                  ~
                </kbd>
                <button
                  type="button"
                  aria-label="Close dev panel"
                  onClick={() => setOpen(false)}
                  data-touch
                  className="grid size-5 place-items-center rounded cursor-pointer transition-[color,background-color] hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            </header>

            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(typeof v === "string" ? v : "themes")
              }
              className="flex min-h-0 flex-1 flex-col gap-0"
            >
              <div className="px-1.5 pt-1.5">
                <TabsList
                  variant="line"
                  className="grid h-7 w-full grid-cols-4 bg-transparent"
                >
                  <TabsTrigger value="themes" className="text-[11px]">
                    Themes
                  </TabsTrigger>
                  <TabsTrigger value="controls" className="text-[11px]">
                    Controls
                  </TabsTrigger>
                  <TabsTrigger value="nav" className="text-[11px]">
                    Nav
                  </TabsTrigger>
                  <TabsTrigger value="data" className="text-[11px]">
                    Data
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="themes"
                className="mt-0 min-h-0 flex-1 border-t border-border"
              >
                <ScrollArea className="h-full">
                  <div className="px-2.5 py-2.5">
                    <ThemesTab />
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent
                value="controls"
                className="mt-0 min-h-0 flex-1 overflow-hidden border-t border-border"
              >
                <ControlsTab />
              </TabsContent>
              <TabsContent
                value="nav"
                className="mt-0 min-h-0 flex-1 border-t border-border"
              >
                <ScrollArea className="h-full">
                  <div className="px-2.5 py-2.5">
                    <NavTab />
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent
                value="data"
                className="mt-0 min-h-0 flex-1 border-t border-border"
              >
                <ScrollArea className="h-full">
                  <div className="px-2.5 py-2.5">
                    <DataTab />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
