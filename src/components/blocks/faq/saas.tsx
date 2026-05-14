"use client"

import { FadeIn } from "@/components/motion/fade-in"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faq } from "@/lib/brand"

export function FaqSaas() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              FAQ
            </p>
            <h2 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Questions we&apos;ve been asked more than once.
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Accordion defaultValue={[`item-0`]}>
            {faq.map((item, i) => (
              <AccordionItem
                key={item.question}
                value={`item-${i}`}
                className="border-border"
              >
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  )
}
