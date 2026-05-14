import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { FadeIn } from "@/components/motion/fade-in"
import { CtaSaas, FooterSaas, StatsSaas } from "@/components/blocks"
import { jobs, valuesList } from "@/lib/brand"

export const metadata = {
  title: "Careers · Nimbus",
}

type Job = (typeof jobs)[number]

const groupedJobs = jobs.reduce<Record<string, Job[]>>((acc, job) => {
  acc[job.team] = acc[job.team] ? [...acc[job.team], job] : [job]
  return acc
}, {})

export default function CareersPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <FadeIn className="md:col-span-7">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Careers
              </p>
              <h1 className="font-heading mt-4 text-balance text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl md:text-7xl">
                Come build the cognitive layer.
              </h1>
              <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground">
                We&apos;re hiring across engineering, research, design, and
                go-to-market. We hire generalists who like reading the entire
                codebase and specialists who like writing the boring 30% really
                well.
              </p>
            </FadeIn>

            <FadeIn delay={0.1} className="md:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {valuesList.slice(0, 4).map((v, i) => (
                  <div
                    key={v.title}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-muted/20 p-4"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">
                      0{i + 1}
                    </span>
                    <span className="text-sm font-medium leading-tight">
                      {v.title}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <StatsSaas />

      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mb-12 flex flex-col gap-2">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Open roles
            </p>
            <h2 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {jobs.length} open roles
            </h2>
          </div>

          <div className="flex flex-col gap-12">
            {Object.entries(groupedJobs).map(([team, list]) => (
              <FadeIn key={team} className="flex flex-col gap-2">
                <h3 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  {team}
                </h3>
                <ul className="flex flex-col">
                  {list.map((job) => (
                    <li key={job.title}>
                      <Link
                        href="/contact"
                        className="group flex items-start justify-between gap-4 border-b border-border py-5 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-heading text-lg font-medium tracking-tight">
                            {job.title}
                          </span>
                          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {job.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {job.location}
                            </span>
                            <span>·</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {job.type}
                            </Badge>
                          </div>
                        </div>
                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CtaSaas />
      <FooterSaas />
    </>
  )
}
