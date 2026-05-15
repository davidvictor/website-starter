"use client"

import { CheckCircle2, Mail, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function FormsSection() {
  return (
    <Section title="Forms">
      <SubSection label="Text inputs">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-name">Name</Label>
            <Input id="fm-name" placeholder="Jane Doe" />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-search">Search</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fm-search"
                placeholder="Search components…"
                className="pl-7"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="fm-disabled">Disabled</Label>
            <Input id="fm-disabled" placeholder="Disabled" disabled />
          </div>
          <Field data-invalid>
            <FieldLabel htmlFor="fm-error">With error</FieldLabel>
            <Input
              id="fm-error"
              placeholder="me@example"
              aria-invalid
              aria-describedby="fm-error-message"
              className="border-destructive focus-visible:ring-destructive/40"
            />
            <FieldError id="fm-error-message">
              Please enter a valid email.
            </FieldError>
          </Field>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Label htmlFor="fm-bio">Bio</Label>
            <Textarea
              id="fm-bio"
              placeholder="Tell us about yourself…"
              rows={4}
            />
          </div>
        </div>
      </SubSection>

      <SubSection label="Selectors">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Checkbox id="fm-check" />
            <Label htmlFor="fm-check">Remember me</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="fm-switch" />
            <Label htmlFor="fm-switch">Enable notifications</Label>
          </div>
          <RadioGroup defaultValue="weekly" className="md:col-span-2">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="daily" id="fm-r-daily" />
              <Label htmlFor="fm-r-daily">Daily digest</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="weekly" id="fm-r-weekly" />
              <Label htmlFor="fm-r-weekly">Weekly digest</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="never" id="fm-r-never" />
              <Label htmlFor="fm-r-never">Never</Label>
            </div>
          </RadioGroup>
          <div className="flex flex-col gap-2">
            <Label>Toggle</Label>
            <Toggle aria-label="Bold">B</Toggle>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Toggle group</Label>
            <ToggleGroup defaultValue={["center"]}>
              <ToggleGroupItem value="left" aria-label="Align left">
                L
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                C
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                R
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </SubSection>

      <SubSection label="Control state matrix">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field>
            <div className="flex items-center gap-3">
              <Checkbox id="fm-check-on" defaultChecked />
              <FieldLabel htmlFor="fm-check-on">Checked</FieldLabel>
            </div>
            <FieldDescription>
              Check icon uses the shared opacity, scale, and blur reveal.
            </FieldDescription>
          </Field>
          <Field>
            <div className="flex items-center gap-3">
              <Checkbox id="fm-check-disabled" disabled />
              <FieldLabel htmlFor="fm-check-disabled">Disabled</FieldLabel>
            </div>
            <FieldDescription>
              Opacity and cursor states stay visible.
            </FieldDescription>
          </Field>
          <Field data-invalid>
            <div className="flex items-center gap-3">
              <Checkbox
                id="fm-check-error"
                aria-invalid
                aria-describedby="fm-check-error-message"
              />
              <FieldLabel htmlFor="fm-check-error">Invalid</FieldLabel>
            </div>
            <FieldError id="fm-check-error-message">
              Accept the policy before continuing.
            </FieldError>
          </Field>
          <Field>
            <div className="flex items-center gap-3">
              <Switch id="fm-switch-on" defaultChecked />
              <FieldLabel htmlFor="fm-switch-on">Enabled</FieldLabel>
            </div>
            <FieldDescription>
              Thumb motion follows the same token pace.
            </FieldDescription>
          </Field>
          <Field>
            <div className="flex items-center gap-3">
              <Switch id="fm-switch-disabled" disabled />
              <FieldLabel htmlFor="fm-switch-disabled">Disabled</FieldLabel>
            </div>
            <FieldDescription>
              Unavailable controls retain shape.
            </FieldDescription>
          </Field>
          <Field>
            <RadioGroup defaultValue="state-b">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="state-a" id="fm-radio-state-a" />
                <FieldLabel htmlFor="fm-radio-state-a">Option A</FieldLabel>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="state-b" id="fm-radio-state-b" />
                <FieldLabel htmlFor="fm-radio-state-b">Option B</FieldLabel>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem
                  value="state-c"
                  id="fm-radio-state-c"
                  disabled
                />
                <FieldLabel htmlFor="fm-radio-state-c">Disabled</FieldLabel>
              </div>
            </RadioGroup>
          </Field>
        </div>
      </SubSection>

      <SubSection label="Sliders & pagination">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label>Density</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div className="flex flex-col gap-3">
            <Label>Range</Label>
            <Slider defaultValue={[20, 80]} max={100} step={1} />
          </div>
          <div className="md:col-span-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </SubSection>

      <SubSection label="Buttons">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">XS</Button>
            <Button size="sm">SM</Button>
            <Button>Default</Button>
            <Button size="lg">LG</Button>
            <Button size="icon">
              <Plus />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <Mail />
              Compose
            </Button>
            <Button variant="outline">
              Continue
              <Plus />
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled>
              <Spinner className="size-4" />
              Saving
            </Button>
            <Button variant="outline" aria-live="polite">
              <CheckCircle2 className="size-4 text-success" />
              Saved
            </Button>
          </div>
        </div>
      </SubSection>

      <SubSection label="Field composition">
        <div className="max-w-sm">
          <Field>
            <FieldLabel htmlFor="fc-username">Username</FieldLabel>
            <Input id="fc-username" placeholder="jdoe" />
            <FieldDescription>
              This is your public display name. It can be changed at any time.
            </FieldDescription>
          </Field>
        </div>
      </SubSection>
    </Section>
  )
}
