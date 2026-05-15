import { Stagger } from "@/components/motion/stagger"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { TestimonialsProps } from "../props"

function personInitials(
  testimonial: TestimonialsProps["testimonials"][number]
) {
  return testimonial.avatar ?? testimonial.author.slice(0, 2).toUpperCase()
}

export function TestimonialsSaas({ testimonials }: TestimonialsProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            What customers say
          </p>
          <h2 className="font-heading max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Operators, engineers, and the occasional VP.
          </h2>
        </div>

        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <Card key={t.author}>
              <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
                <p className="text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {personInitials(t)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0">
                    <span className="text-sm font-medium leading-tight">
                      {t.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.title} · {t.company}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
