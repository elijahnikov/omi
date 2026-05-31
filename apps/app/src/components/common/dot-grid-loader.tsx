import { DotmCircular20 } from "@omi/ui/dotm-circular-20";
import { DotmSquare1 } from "@omi/ui/dotm-square-1";

export function DotGridLoader({ circular = false }: { circular?: boolean }) {
  if (circular) {
    return <DotmCircular20 dotSize={2} size={16} speed={1} />;
  }
  return <DotmSquare1 dotSize={2} size={16} speed={1} />;
}
