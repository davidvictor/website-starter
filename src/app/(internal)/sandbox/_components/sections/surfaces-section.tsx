import {
  AlertCircle,
  CheckCircle2,
  Info,
  MoreHorizontal,
  Star,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Section } from "../section"
import { SubSection } from "../sub-section"

export function SurfacesSection() {
  return (
    <Section title="Surfaces">
      <SubSection label="Cards">
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly report</CardTitle>
              <CardDescription>
                Q1 metrics summary. Updated 4 hours ago.
              </CardDescription>
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

      <SubSection label="Skeleton">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </SubSection>

      <SubSection label="Progress">
        <div className="flex flex-col gap-3">
          <Progress value={0} />
          <Progress value={62} />
          <Progress value={100} />
        </div>
      </SubSection>

      <SubSection label="Separator">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>Above the line</span>
          <Separator />
          <span>Below the line</span>
        </div>
      </SubSection>

      <SubSection label="Avatar">
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

      <SubSection label="Empty">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No items yet</EmptyTitle>
            <EmptyDescription>
              When data shows up, it appears here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SubSection>
    </Section>
  )
}
