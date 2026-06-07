import { Badge } from "@omi/ui/badge";

const SUBTITLE_PART_SEP = /\s·\s/;

function splitSyncedSubtitle(subtitle: string): string[] {
  return subtitle.split(SUBTITLE_PART_SEP).filter(Boolean);
}

export function SyncedSubtitleParts({
  subtitle,
  className,
}: {
  subtitle: string;
  className?: string;
}) {
  const parts = splitSyncedSubtitle(subtitle);

  return (
    <span
      className={`flex shrink-0 items-center gap-1.5${className ? ` ${className}` : ""}`}
    >
      {parts.map((part, index) => (
        <Badge
          className="shrink-0 text-xs"
          key={`${part}-${index}`}
          variant="mono"
        >
          {part}
        </Badge>
      ))}
    </span>
  );
}
