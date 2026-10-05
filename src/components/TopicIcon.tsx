import { Building2, Coffee, Cpu, Drama, FileText, Globe2, Landmark, Shield, TrendingUp } from "lucide-react";
import type { Topic } from "@/content/types";
import { TOPIC_TINT, tintCircle } from "@/lib/tints";

const ICONS: Record<Topic, typeof Coffee> = {
  Life: Coffee,
  Society: Building2,
  Culture: Drama,
  Tech: Cpu,
  World: Globe2,
  Security: Shield,
  Politics: Landmark,
  Economy: TrendingUp,
};

/** Line icon in a topic-tinted circle, used instead of emoji for content. */
export default function TopicIcon({ topic, imported, size = 48 }: { topic: Topic; imported?: boolean; size?: number }) {
  const Icon = imported ? FileText : ICONS[topic];
  return (
    <span className={imported ? "icon-circle" : tintCircle(TOPIC_TINT[topic])} style={{ width: size, height: size }}>
      <Icon size={size * 0.42} strokeWidth={1.6} />
    </span>
  );
}
