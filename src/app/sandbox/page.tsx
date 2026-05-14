"use client"

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Info,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Star,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "@/providers/theme-provider"
import { resolveTokens } from "@/themes/registry"
import {
  COLOR_TOKEN_KEYS,
  COLOR_TOKEN_TO_CSS_VAR,
  type ColorTokens,
} from "@/themes/types"

export default function SandboxPage() {
  const { theme, resolvedMode } = useTheme()
  const tokens = resolveTokens(theme, resolvedMode)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs tracking-wider text-muted-foreground uppercase">
          /sandbox
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          {theme.name} design system
        </h1>
        {theme.description && (
          <p className="text-balance text-muted-foreground">
            {theme.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">theme · {theme.id}</Badge>
          <Badge variant="secondary">mode · {resolvedMode}</Badge>
          <Badge variant="secondary">
            radius · <span className="font-mono">{theme.derivation.radius}</span>
          </Badge>
          <Badge variant="secondary">
            sans · {theme.derivation.fonts.sans}
          </Badge>
          <Badge variant="secondary">
            mono · {theme.derivation.fonts.mono}
          </Badge>
          <Badge variant="secondary">
            accent · {theme.derivation.accentUsage}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Open the dev panel (<kbd className="rounded border border-border bg-muted px-1 font-mono">~</kbd>) to switch themes, toggle mode, edit tokens.
        </p>
      </header>

      <Section title="Color tokens" subtitle={`Resolved for ${resolvedMode}`}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {COLOR_TOKEN_KEYS.map((key) => (
            <ColorSwatch key={key} tokenKey={key} value={tokens[key]} />
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-6">
          <TypeRow
            label="display · font-heading"
            sample="The quick brown fox jumps over the lazy dog."
            className="font-heading text-5xl leading-tight tracking-tight"
          />
          <TypeRow
            label="h1 · font-sans"
            sample="Marketing experiments live here."
            className="font-sans text-3xl font-semibold tracking-tight"
          />
          <TypeRow
            label="h2 · font-sans"
            sample="Each section is a prototype."
            className="font-sans text-2xl font-semibold tracking-tight"
          />
          <TypeRow
            label="body · font-sans"
            sample="Body text uses the sans variable. It should read comfortably at 16px on most modern devices, with hanging punctuation and balanced wrapping where supported."
            className="font-sans text-base leading-relaxed"
          />
          <TypeRow
            label="small · font-sans"
            sample="Smaller text for captions and asides."
            className="font-sans text-sm text-muted-foreground"
          />
          <TypeRow
            label="mono · font-mono"
            sample="const greeting = `hello, ${name}`"
            className="font-mono text-sm"
          />
        </div>
      </Section>

      <Section title="Radii">
        <div className="flex flex-wrap gap-4">
          {[
            { label: "sm", className: "rounded-sm" },
            { label: "md", className: "rounded-md" },
            { label: "lg", className: "rounded-lg" },
            { label: "xl", className: "rounded-xl" },
            { label: "2xl", className: "rounded-2xl" },
            { label: "full", className: "rounded-full" },
          ].map(({ label, className }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`size-16 border border-border bg-muted ${className}`}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <SubSection label="Variants">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </SubSection>
        <SubSection label="Sizes">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">XS</Button>
            <Button size="sm">SM</Button>
            <Button>Default</Button>
            <Button size="lg">LG</Button>
            <Button size="icon">
              <Plus />
            </Button>
          </div>
        </SubSection>
        <SubSection label="With icons">
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
        </SubSection>
      </Section>

      <Section title="Form controls">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="sb-name">Name</Label>
            <Input id="sb-name" placeholder="Jane Doe" />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="sb-search">Search</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="sb-search"
                placeholder="Search components…"
                className="pl-7"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Label htmlFor="sb-bio">Bio</Label>
            <Textarea id="sb-bio" placeholder="Tell us about yourself…" rows={4} />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="sb-check" />
            <Label htmlFor="sb-check">Remember me</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="sb-switch" />
            <Label htmlFor="sb-switch">Enable notifications</Label>
          </div>
          <RadioGroup defaultValue="weekly" className="md:col-span-2">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="daily" id="sb-r-daily" />
              <Label htmlFor="sb-r-daily">Daily digest</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="weekly" id="sb-r-weekly" />
              <Label htmlFor="sb-r-weekly">Weekly digest</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="never" id="sb-r-never" />
              <Label htmlFor="sb-r-never">Never</Label>
            </div>
          </RadioGroup>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Label>Density</Label>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Label>Progress</Label>
            <Progress value={62} />
          </div>
        </div>
      </Section>

      <Section title="Feedback">
        <SubSection label="Alerts">
          <div className="grid gap-3 sm:grid-cols-2">
            <Alert>
              <Info />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Default alert with an icon and description.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                Destructive alerts use the destructive token.
              </AlertDescription>
            </Alert>
          </div>
        </SubSection>
        <SubSection label="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge>
              <CheckCircle2 className="size-3" />
              With icon
            </Badge>
          </div>
        </SubSection>
        <SubSection label="Skeletons">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        </SubSection>
      </Section>

      <Section title="Surfaces">
        <SubSection label="Cards">
          <div className="grid gap-3 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Card description goes here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards are the workhorse surface for grouping content.
                </p>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardHeader className="gap-2">
                <Badge variant="secondary" className="w-fit">
                  <Star className="size-3" />
                  Variant
                </Badge>
                <CardTitle>Dashed border card</CardTitle>
                <CardDescription>
                  Customize per surface with utility classes.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </SubSection>
      </Section>

      <Section title="Navigation">
        <SubSection label="Tabs">
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="p-3 text-sm">
              Account tab content
            </TabsContent>
            <TabsContent value="billing" className="p-3 text-sm">
              Billing tab content
            </TabsContent>
            <TabsContent value="team" className="p-3 text-sm">
              Team tab content
            </TabsContent>
          </Tabs>
        </SubSection>

        <SubSection label="Accordion">
          <Accordion defaultValue={["item-1"]}>
            <AccordionItem value="item-1">
              <AccordionTrigger>What is this sandbox for?</AccordionTrigger>
              <AccordionContent>
                It&apos;s the canonical design-system reference for the active
                theme. Switch themes from the dev panel to see how every
                primitive responds.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How are themes stored?</AccordionTrigger>
              <AccordionContent>
                Themes are JSON in <code>src/themes/registry.json</code>. Local
                edits live in <code>localStorage</code> and can be copied as
                JSON to persist.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SubSection>
      </Section>

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
                <Label htmlFor="sb-email">Email</Label>
                <Input
                  id="sb-email"
                  type="email"
                  placeholder="me@example.com"
                />
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SubSection>
      </Section>

      <Section title="Data display">
        <SubSection label="Avatars">
          <div className="flex flex-wrap items-center gap-2">
            <Avatar>
              <AvatarFallback>DV</AvatarFallback>
            </Avatar>
            <Avatar className="size-12">
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <Avatar className="size-8">
              <AvatarFallback>
                <MoreHorizontal className="size-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </SubSection>
        <SubSection label="Separator">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>Above the line</span>
            <Separator />
            <span>Below the line</span>
          </div>
        </SubSection>
      </Section>
    </main>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

function SubSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </h3>
      {children}
    </div>
  )
}

function TypeRow({
  label,
  sample,
  className,
}: {
  label: string
  sample: string
  className: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-border pl-4">
      <span className="font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <p className={className}>{sample}</p>
    </div>
  )
}

function ColorSwatch({
  tokenKey,
  value,
}: {
  tokenKey: keyof ColorTokens
  value: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-2">
      <div
        className="aspect-[4/3] w-full rounded border border-border"
        style={{ background: value }}
      />
      <div className="flex flex-col gap-0">
        <span className="truncate font-mono text-[10px] text-muted-foreground">
          {COLOR_TOKEN_TO_CSS_VAR[tokenKey]}
        </span>
        <span className="truncate font-mono text-[10px]">{value}</span>
      </div>
    </div>
  )
}
