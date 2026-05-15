"use client"

import { Bell } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function OverlaysSection() {
  return (
    <Section title="Overlays">
      <SubSection label="Dialog">
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline">
                <Bell />
                Open dialog
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notify me</DialogTitle>
              <DialogDescription>
                Choose how you&apos;d like to be reached.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-3">
              <Label htmlFor="ov-email">Email</Label>
              <Input id="ov-email" type="email" placeholder="me@example.com" />
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SubSection>

      <SubSection label="Alert dialog">
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive">Delete project</Button>}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SubSection>

      <SubSection label="Sheet">
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline">Open sheet</Button>}
          />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes here. Click save when you&apos;re done.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 p-4">
              <Label htmlFor="sh-name">Name</Label>
              <Input id="sh-name" placeholder="Jane Doe" />
            </div>
          </SheetContent>
        </Sheet>
      </SubSection>

      <SubSection label="Drawer">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick actions</DrawerTitle>
              <DrawerDescription>
                A bottom-sheet style overlay for touch surfaces.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Confirm</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SubSection>

      <SubSection label="Popover">
        <Popover>
          <PopoverTrigger
            render={<Button variant="outline">Settings</Button>}
          />
          <PopoverContent>
            <div className="flex flex-col gap-3 p-2">
              <Label htmlFor="po-name">Display name</Label>
              <Input id="po-name" defaultValue="Jane Doe" />
            </div>
          </PopoverContent>
        </Popover>
      </SubSection>

      <SubSection label="Hover card">
        <HoverCard>
          <HoverCardTrigger render={<Button variant="link">@jdoe</Button>} />
          <HoverCardContent>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Jane Doe</span>
              <span className="text-xs text-muted-foreground">
                Joined March 2026 · 12 projects
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>
      </SubSection>

      <SubSection label="Tooltip">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline">Hover me</Button>}
          />
          <TooltipContent>Tooltips appear on hover or focus.</TooltipContent>
        </Tooltip>
      </SubSection>

      <SubSection label="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline">Open menu</Button>}
          />
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </SubSection>

      <SubSection label="Context menu">
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Right-click anywhere in this box
              </div>
            }
          />
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuItem>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </SubSection>

      <SubSection label="Command">
        <Command className="rounded-md border border-border">
          <CommandInput placeholder="Type a command…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Open dialog</CommandItem>
              <CommandItem>Toggle theme</CommandItem>
              <CommandItem>New file</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </SubSection>
    </Section>
  )
}
