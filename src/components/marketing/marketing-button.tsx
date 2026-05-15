import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"

import { Press } from "@/components/motion/press"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MarketingButtonIcon = "arrow-right" | "arrow-up-right" | "none"
type ButtonVariantProps = NonNullable<Parameters<typeof buttonVariants>[0]>

type MarketingButtonProps = {
  href: string
  children: React.ReactNode
  className?: string
  variant?: ButtonVariantProps["variant"]
  size?: ButtonVariantProps["size"]
  icon?: MarketingButtonIcon
}

function Icon({ icon }: { icon: MarketingButtonIcon }) {
  if (icon === "none") return null
  const IconComponent = icon === "arrow-up-right" ? ArrowUpRight : ArrowRight
  return <IconComponent data-icon="inline-end" className="size-4" />
}

/**
 * Link-shaped CTA wrapper for marketing blocks. It keeps directional icons,
 * press feedback, and shadcn button variants cohesive without editing the
 * off-bounds button primitive.
 */
export function MarketingButton({
  href,
  children,
  className,
  variant,
  size = "lg",
  icon = "arrow-right",
}: MarketingButtonProps) {
  return (
    <Press
      render={
        <Link
          href={href}
          className={cn(buttonVariants({ variant, size }), className)}
        >
          {children}
          <Icon icon={icon} />
        </Link>
      }
    />
  )
}
