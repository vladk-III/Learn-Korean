import { Building2, Coffee, Cpu, Drama, FileText, Globe2 } from "lucide-react";
import type { Topic } from "@/content/types";

const ICONS: Record<Topic, typeof Coffee> = {
  Life: Coffee,
  Society: Building2,
  Culture: Drama,
  Tech: Cpu,
  World: Globe2,
};

/** Line icon in a soft gray circle, used instead of emoji for content. */
export default function TopicIcon({ topic, imported, size = 48 }: { topic: Topic; imported?: boolean; size?: number }) {
  const Icon = imported ? FileText : ICONS[topic];
  return (
    <span className="icon-circle" style={{ width: size, height: size }}>
      <Icon size={size * 0.42} strokeWidth={1.6} />
    </span>
  );
}
