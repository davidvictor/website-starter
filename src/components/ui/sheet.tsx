"use client"

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "motion/react"
import * as React from "react"

import { SPRING_MACRO } from "@/components/motion/springs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Sheet — motion/react + AnimatePresence per ADR 0002 (hybrid).
 * Per-side translate variants drive the slide-in/out animation.
 */

const SheetOpenContext = React.createContext<boolean>(false)

type SheetSide = "top" | "right" | "bottom" | "left"

function Sheet({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: SheetPrimitive.Root.Props) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  return (
    <SheetOpenContext.Provider value={open}>
      <SheetPrimitive.Root
        open={openProp}
        defaultOpen={defaultOpen}
        onOpenChange={(o, e) => {
          if (!isControlled) setInternalOpen(o)
          onOpenChange?.(o, e)
        }}
        {...props}
      />
    </SheetOpenContext.Provider>
  )
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      render={
        <motion.div
          data-motion="macro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SPRING_MACRO}
        />
      }
      className={cn(
        "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

const SHEET_OFFSET = "2.5rem"

const SHEET_VARIANTS: Record<SheetSide, Variants> = {
  right: {
    initial: { opacity: 0, x: SHEET_OFFSET },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: SHEET_OFFSET },
  },
  left: {
    initial: { opacity: 0, x: `-${SHEET_OFFSET}` },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: `-${SHEET_OFFSET}` },
  },
  top: {
    initial: { opacity: 0, y: `-${SHEET_OFFSET}` },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: `-${SHEET_OFFSET}` },
  },
  bottom: {
    initial: { opacity: 0, y: SHEET_OFFSET },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: SHEET_OFFSET },
  },
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: SheetSide
  showCloseButton?: boolean
}) {
  const open = React.useContext(SheetOpenContext)
  const variants = SHEET_VARIANTS[side]

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal keepMounted>
          <SheetOverlay />
          <SheetPrimitive.Popup
            data-slot="sheet-content"
            data-side={side}
            render={
              <motion.div
                data-motion="macro"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={SPRING_MACRO}
              />
            }
            className={cn(
              "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-[var(--shadow-overlay)] data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
              className
            )}
            {...props}
          >
            {children}
            {showCloseButton && (
              <SheetPrimitive.Close
                data-slot="sheet-close"
                render={
                  <Button
                    variant="ghost"
                    className="absolute top-3 right-3"
                    size="icon-sm"
                    data-touch
                  />
                }
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            )}
          </SheetPrimitive.Popup>
        </SheetPortal>
      )}
    </AnimatePresence>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
}
