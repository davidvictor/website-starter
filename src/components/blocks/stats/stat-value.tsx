import { AnimatedNumber } from "@/components/motion/animated-number"
import { formatMetric } from "@/lib/format"
import type { StatsProps } from "../props"

type StatItem = StatsProps["stats"][number]

export function StatValue({ stat }: { stat: StatItem }) {
  if ("metric" in stat) {
    return (
      <AnimatedNumber
        value={stat.metric.value}
        format={(value) => formatMetric({ ...stat.metric, value })}
      />
    )
  }

  return stat.value
}
