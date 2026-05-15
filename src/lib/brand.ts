/**
 * Fictional company used to populate the marketing scaffold.
 * All copy is parody-energy — confident, unhinged, AI hype-cycle adjacent.
 *
 * Numeric data uses the typed shapes in `@/lib/format`. See
 * docs/adr/0008-brand-numeric-schema.md.
 */

import type { Metric, PricingTier } from "@/lib/brand-types"

export const brand = {
  name: "Nimbus",
  wordmark: "nimbus",
  domain: "nimbus.ai",
  description:
    "Cognitive infrastructure for teams that have outgrown their dashboards.",
  founded: 2027,
  funding: {
    stage: "Series B",
    valuation: {
      value: 4.2e9,
      format: "compact" as const,
      precision: 1,
    } satisfies Metric,
    led: "Sequoia, with participation from anyone who answered our calls",
  },
  socials: {
    x: "https://x.com/nimbus",
    github: "https://github.com/nimbus-ai",
    linkedin: "https://linkedin.com/company/nimbus",
  },
  /** Static year used for footer copyright — avoids `new Date()` in RSC under Cache Components. */
  currentYear: 2026,
} as const

export const taglines = {
  primary: "Computers that finally get the assignment.",
  secondary:
    "Nimbus is the cognitive surface area your engineering team didn't know it needed. Until now. Until us.",
  short: "Reasoning that ships. Hallucinations that don't (mostly).",
} as const

const leadInvestor = brand.funding.led.split(",")[0] ?? brand.funding.led

export const blockContent = {
  hero: {
    eyebrow: `${brand.funding.stage} · led by ${leadInvestor}`,
    headline: {
      before: "Computers that finally",
      emphasis: "get the assignment.",
    },
    proof: "No credit card. SOC2 by default. 5-minute install.",
    cta: {
      primary: { label: "Start free", href: "/pricing" },
      secondary: { label: `Why we built ${brand.name}`, href: "/about" },
    },
  },
  pricing: {
    headline: "Start free. Scale honestly.",
    subhead:
      "All plans include unlimited workspaces, SOC2 by default, and a real human you can email.",
  },
  cta: {
    eyebrow: "Closing notes",
    headline: {
      before: "Ready to ship reasoning",
      emphasis: "to production?",
    },
    body: "Start free, scale with usage. Or talk to us about volume and custom deployments.",
    cta: {
      primary: { label: "Start free", href: "/pricing" },
      secondary: { label: "Talk to sales", href: "/contact" },
    },
  },
} as const

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/customers", label: "Customers" },
  { href: "/changelog", label: "Changelog" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
] as const

export const products = [
  {
    name: "Cortex",
    tagline: "The agentic compute layer.",
    description:
      "Spawn agents that actually finish the task. Plug in your tools, your data, your context — Cortex handles the rest. Yes, including the part where it explains itself afterward.",
    icon: "Brain",
  },
  {
    name: "Echo",
    tagline: "Real-time interaction, sub-100ms.",
    description:
      "Voice, text, and screen-share, all in one streaming primitive. The latency is so low it occasionally answers before you ask.",
    icon: "AudioLines",
  },
  {
    name: "Synthesis",
    tagline: "Model orchestration without the ceremony.",
    description:
      "Route across providers, fall back gracefully, log everything. Stop writing the same retry loop in seven languages.",
    icon: "GitBranch",
  },
] as const

export const heroBullets = [
  "Ship agents in days, not consulting engagements",
  "Sub-100ms latency on the streaming layer",
  "SOC2 by default — type II if you ask politely",
  "Used by companies you'd recognize and a few you wouldn't",
] as const

export const features = [
  {
    title: "Reasoning that ships",
    body: "We let the model think out loud. Then we let it ship. The two events are no longer separated by a 14-step approval workflow.",
    icon: "Brain",
  },
  {
    title: "Sub-100ms streaming",
    body: "Echo's wire format is so tight it makes WebRTC look chatty. Voice, text, and tool calls — all in one stream.",
    icon: "Zap",
  },
  {
    title: "Tool-use that doesn't lie",
    body: "Function calling with grounded receipts. If it says it called your API, your logs will agree.",
    icon: "Wrench",
  },
  {
    title: "Evaluation as a first-class verb",
    body: "Wire up traces, sample, replay, and grade — without leaving your repo. Your future self will send you a thank-you note.",
    icon: "Beaker",
  },
  {
    title: "Compliance you can read",
    body: "SOC2, GDPR, the alphabet soup. We've already paid the lawyers; you can't see them, but they're there.",
    icon: "ShieldCheck",
  },
  {
    title: "Pricing that survives a board meeting",
    body: "Usage-based, no rug-pulls, no \"contact sales\" until you're spending real money. Then we'll happily contact you.",
    icon: "Receipt",
  },
] as const

/**
 * Typed metrics. `value` is the raw number; format helpers in
 * `@/lib/format` produce display strings.
 */
export const stats = [
  {
    metric: { value: 9.2e12, format: "compact", precision: 1 } satisfies Metric,
    label: "Tokens processed last quarter",
  },
  {
    metric: { value: 67, unit: "ms", format: "plain" } satisfies Metric,
    label: "P50 streaming latency",
  },
  {
    metric: {
      value: 0.99997,
      format: "percent",
      precision: 3,
    } satisfies Metric,
    label: "Uptime since June",
  },
  {
    metric: { value: 412, format: "plain" } satisfies Metric,
    label: "Production deployments this week",
  },
] as const

export const customerLogos = [
  { name: "Hyperion Labs", initials: "HL" },
  { name: "Cinder", initials: "CN" },
  { name: "Yondr", initials: "YN" },
  { name: "Arclight", initials: "AL" },
  { name: "Parable", initials: "PB" },
  { name: "Lumen Health", initials: "LH" },
  { name: "Strata", initials: "ST" },
  { name: "Quill", initials: "QU" },
] as const

export const testimonials = [
  {
    quote:
      "We replaced six microservices, two contractors, and one ill-advised internal framework with Nimbus. Our standup is now five minutes long. We have nothing to discuss.",
    name: "Priya Anand",
    title: "Head of Platform",
    company: "Hyperion Labs",
    avatar: "PA",
  },
  {
    quote:
      "I expected a model API. I got a small, well-mannered cognitive workforce that asks before refactoring my schema. 5/5 would adopt again.",
    name: "Marcus Reidel",
    title: "Staff Engineer",
    company: "Cinder",
    avatar: "MR",
  },
  {
    quote:
      "Our finance team can finally read the bill. Our security team has stopped sending me articles. I'd describe it as religious experience-adjacent.",
    name: "Lin Wong",
    title: "VP Engineering",
    company: "Yondr",
    avatar: "LW",
  },
  {
    quote:
      "Cortex onboarded itself, wrote its own runbook, and then politely declined to be on-call. We're still discussing that last part.",
    name: "Dani Okafor",
    title: "Director of Infra",
    company: "Arclight",
    avatar: "DO",
  },
  {
    quote:
      "The latency on Echo is so low it occasionally feels like the API is finishing my sentences. It is, in fact, finishing my sentences.",
    name: "Cole Whitford",
    title: "Founding Engineer",
    company: "Parable",
    avatar: "CW",
  },
  {
    quote:
      "We saved $1.4M annually and got a thoughtful, well-typed SDK. Either of those alone would have been enough. The combination is borderline rude.",
    name: "Sofia Marchetti",
    title: "CTO",
    company: "Lumen Health",
    avatar: "SM",
  },
] as const

export const pricingTiers: readonly PricingTier[] = [
  {
    id: "spark",
    name: "Spark",
    price: { value: 0, currency: "USD", cadence: "month" },
    priceYearly: { value: 0, currency: "USD", cadence: "year" },
    description: "For weekend agents that may or may not see prod.",
    features: [
      "1 project",
      "10k tokens/day on Cortex",
      "Echo: dev environment only",
      "Community Slack (we read it)",
      "MIT-friendly examples",
    ],
    cta: "Start sparking",
    featured: false,
  },
  {
    id: "surge",
    name: "Surge",
    price: { value: 49, currency: "USD", cadence: "month" },
    priceYearly: { value: 470, currency: "USD", cadence: "year" },
    description: "For teams shipping things people actually depend on.",
    features: [
      "Unlimited projects",
      "Cortex with auto-fallbacks",
      "Echo production latency tier",
      "Synthesis orchestration with eval traces",
      "SAML/SSO without the SAML tax",
      "Priority engineering Slack",
    ],
    cta: "Try Surge",
    featured: true,
  },
  {
    id: "singularity",
    name: "Singularity",
    price: null,
    priceYearly: null,
    description:
      "For when 'usage-based' has stopped fitting in your CFO's tooling.",
    features: [
      "Everything in Surge",
      "Dedicated capacity, dedicated humans",
      "On-prem and BYO-cloud",
      "Custom evals + red-teaming",
      "24/7 support with an actual phone",
      "An NDA you'll enjoy reading",
    ],
    cta: "Book a call",
    featured: false,
  },
] as const

export const faq = [
  {
    question: "How is Nimbus different from just calling an LLM API directly?",
    answer:
      "It's the difference between owning a wheel and owning a car. Calling the model is one verb. Shipping a production agent is fifty. Nimbus handles the other forty-nine: routing, fallbacks, evals, tracing, retries, tool grounding, rate limits, billing, and the long list of small things that ruin Fridays.",
  },
  {
    question: "Is this open source?",
    answer:
      "The SDK and most of the eval tooling are MIT. The core orchestration plane is source-available under our (genuinely permissive) commercial license. We're not making you read it again.",
  },
  {
    question: "What models do you support?",
    answer:
      "All the obvious ones — Anthropic, OpenAI, Google, Meta — and a long tail of self-hosted and fine-tuned models via Synthesis. Routing is yours; fallback is ours.",
  },
  {
    question: "Do you train on our data?",
    answer:
      "Never. Not for product. Not for marketing. Not for that one 'aggregated insights' loophole every other vendor uses. Your prompts, completions, and embeddings stay yours.",
  },
  {
    question: "How does pricing actually work?",
    answer:
      "Spark is free forever for hobby use. Surge is per-seat plus usage. Singularity is whatever your procurement team will sign — we'll make it work. There is no third bracket where we 10x the price quietly. You'll notice. We'll tell you anyway.",
  },
  {
    question: "Where are you in the hype cycle?",
    answer: "Late peak, sprinting toward trough. We brought snacks.",
  },
] as const

export const changelog = [
  {
    version: "0.42.0",
    date: "2026-05-08",
    title: "Echo gets a real-time tool API",
    summary:
      "Tool calls now stream their arguments and results inline alongside text. Latency budget unchanged. Your barge-in handler thanks you.",
    tags: ["Echo", "API"],
  },
  {
    version: "0.41.2",
    date: "2026-04-29",
    title: "Synthesis fallback policies are now declarative",
    summary:
      "Define provider order, cost ceilings, and grading rubrics in one config. Your weekly post-mortem just got 80% shorter.",
    tags: ["Synthesis"],
  },
  {
    version: "0.41.0",
    date: "2026-04-17",
    title: "Cortex agents support 'gentle pause'",
    summary:
      "Agents can now park their plan midway through and ask for explicit confirmation before high-blast-radius operations. We tested this with one engineer who really wanted us to.",
    tags: ["Cortex", "Safety"],
  },
  {
    version: "0.40.0",
    date: "2026-04-03",
    title: "Evals: live grading + replay",
    summary:
      "Sample traces in real time, grade them inline, and replay against shadow deployments. The feedback loop is back.",
    tags: ["Evals"],
  },
  {
    version: "0.39.7",
    date: "2026-03-21",
    title: "Edge regions in Frankfurt and Mumbai",
    summary: "Streaming P50 in EU dropped 31ms. We didn't ask. They did.",
    tags: ["Infra"],
  },
  {
    version: "0.39.0",
    date: "2026-03-09",
    title: "Project-scoped API keys",
    summary:
      "Tight scopes, automatic rotation, and a UI you can actually defend in a security review.",
    tags: ["Auth"],
  },
] as const

export const blogPosts = [
  {
    slug: "we-stopped-writing-retry-loops",
    title: "We stopped writing retry loops. So can you.",
    excerpt:
      "Provider fallback isn't an exotic feature. It's a load-bearing primitive. Here's how Synthesis treats it.",
    author: { name: "Jules Park", role: "Founding engineer" },
    date: "2026-05-02",
    readTime: "6 min read",
    tag: "Engineering",
  },
  {
    slug: "the-anatomy-of-a-good-eval",
    title: "The anatomy of a good eval",
    excerpt:
      "Most evals measure the thing the team had time to measure. Here's how to measure what your customers care about instead.",
    author: { name: "Priya Anand", role: "Head of Platform" },
    date: "2026-04-19",
    readTime: "9 min read",
    tag: "Product",
  },
  {
    slug: "agents-are-not-employees",
    title: "Agents are not employees (and other things VCs got wrong)",
    excerpt:
      "A short essay on what we built, what we did not build, and the difference between cognition and headcount.",
    author: { name: "Marcus Reidel", role: "Staff engineer" },
    date: "2026-04-01",
    readTime: "11 min read",
    tag: "Essay",
  },
  {
    slug: "shipping-echo-in-public",
    title: "Shipping Echo in public",
    excerpt:
      "What we learned releasing our streaming layer to 4,000 hobbyists before our first paying customer.",
    author: { name: "Lin Wong", role: "VP Engineering" },
    date: "2026-03-18",
    readTime: "7 min read",
    tag: "Engineering",
  },
] as const

export const blogPostBody = `
We started with a four-line script. It retried on errors. It logged to stdout. It worked on a Tuesday.

The version of that script three months later was 800 lines, four queues, and a quiet animosity between the on-call engineer and JSON. Sound familiar?

This is the story of how we stopped writing retry loops — and what we built instead.

## The retry loop is a load-bearing fiction

Every "production-ready" LLM integration starts with the same shape: a try/catch, an exponential backoff, a comment that says \`// TODO: handle 429\`. It is the seatbelt of the AI era.

It is also where most of the unexpected complexity lives.

- Different providers fail differently. OpenAI's 429 means "wait a little." Anthropic's means "wait a lot." Some providers return a 200 with an error embedded in the body. You will learn each of these in production.
- Retries hide drift. A model deprecation that was supposed to be a hard error becomes a fallback to a worse model that's been quietly serving 4% of traffic for six weeks.
- Retries cost money. The provider you can least afford to call repeatedly is the one most likely to time out.

We learned all of this the same way you did. Then we wrote it down.

## Fallback as a declarative thing

Synthesis treats fallback the way Kubernetes treats deployments: as a declared intent, not a procedural script.

\`\`\`ts
import { route } from "@nimbus/synthesis"

export const reply = route({
  primary: "anthropic/claude-4-7-opus",
  fallbacks: ["openai/gpt-5", "google/gemini-2-pro"],
  budgets: { cost: 0.18, tokens: 4_000 },
  on: { rateLimit: "fallback", timeout: 8_000 },
})
\`\`\`

That's the whole API. Behind it: a tiny scheduler that knows which providers are healthy this minute, a cost ceiling that fires before your CFO does, and a trace that survives the round trip.

The retry loop is dead. We've sent flowers.

## What we keep

We didn't replace human judgment. Synthesis won't decide _what_ to call. It will not write your eval. It will not negotiate your spend with the model lab. Those are still your job.

What it does: it removes the thirty seconds of latency and the forty minutes of post-mortem from the experience of running an LLM in production.

That's it. That's the post.

— Jules
`

export const customers = [
  {
    name: "Hyperion Labs",
    industry: "Robotics",
    size: "1,200 engineers",
    quote:
      "We swapped six internal services for one Synthesis route. The diff was negative 11,000 lines.",
    contact: "Priya Anand · Head of Platform",
    metric: {
      label: "Reduction in incident MTTR",
      value: { value: -0.63, format: "percent", precision: 0 } satisfies Metric,
    },
    logo: "HL",
  },
  {
    name: "Cinder",
    industry: "Developer tools",
    size: "180 engineers",
    quote:
      "Cortex agents pair with our humans on every PR. Reviewers get to focus on intent, not formatting.",
    contact: "Marcus Reidel · Staff Engineer",
    metric: {
      label: "Faster PR turnaround",
      value: {
        value: 3.4,
        unit: "x",
        format: "plain",
        precision: 1,
      } satisfies Metric,
    },
    logo: "CN",
  },
  {
    name: "Yondr",
    industry: "Fintech",
    size: "Series C",
    quote:
      "Our compliance team approves Synthesis routes faster than they approve copy changes. That is a sentence we never thought we'd say.",
    contact: "Lin Wong · VP Engineering",
    metric: {
      label: "Annual model spend reduction",
      value: {
        value: 1.4e6,
        format: "currency",
        precision: 1,
      } satisfies Metric,
    },
    logo: "YN",
  },
] as const

export const jobs = [
  {
    title: "Staff Engineer, Cortex",
    team: "Cortex",
    location: "SF / Remote",
    type: "Full-time",
    description:
      "Architect the agentic execution layer. You'll work on planners, sandboxes, and the difference between 'agent finished the task' and 'agent finished doing something'.",
  },
  {
    title: "Forward Deployed Engineer",
    team: "Customers",
    location: "NY / Remote",
    type: "Full-time",
    description:
      "Sit alongside our biggest customers and help them go from prototype to prod. You write code, you write docs, you write apologies (rarely).",
  },
  {
    title: "Design Engineer, Marketing",
    team: "Design",
    location: "SF",
    type: "Full-time",
    description:
      "Own the marketing site as a craft surface. If you can hand-tune a hero in your sleep, this is the role.",
  },
  {
    title: "Research Engineer, Evals",
    team: "Research",
    location: "SF / Remote",
    type: "Full-time",
    description:
      "Design and build the eval primitives. You think rigorously about what 'good' means, then turn that into a number.",
  },
  {
    title: "Head of Solutions",
    team: "Go-to-market",
    location: "SF",
    type: "Full-time",
    description:
      "Build the solutions function from zero. You'll work directly with our most ambitious customers and own how their architecture comes together.",
  },
] as const

export const teamCounts = [
  { label: "Engineering", value: 42 },
  { label: "Research", value: 9 },
  { label: "Design", value: 6 },
  { label: "Go-to-market", value: 11 },
  { label: "Operations", value: 5 },
] as const

export const valuesList = [
  {
    title: "Ship the boring version.",
    body: "Most ambition fails on velocity. We default to the boring, shippable version and let the interesting parts emerge.",
  },
  {
    title: "Receipts > vibes.",
    body: "Every claim needs a trace. Every trace needs a way to be replayed. If we can't show it, we don't say it.",
  },
  {
    title: "Optimize for the next engineer.",
    body: "The interface that's easiest to write is rarely the one that's easiest to read. We over-index on the latter.",
  },
  {
    title: "Default to public.",
    body: "Roadmaps, runbooks, changelogs — out where customers can read them. The cost of hiding things is higher than the cost of writing them down.",
  },
] as const
