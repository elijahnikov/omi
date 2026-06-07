import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Button } from "@omi/ui/button";
import { Heading } from "@omi/ui/heading";
import { Text } from "@omi/ui/text";
import { useNavigate, useParams } from "@tanstack/react-router";
import { userSettingsSearch } from "~/lib/user-settings-nav";
import { HomeCard } from "./card";

export function UpgradeNudgeCard() {
  const navigate = useNavigate();
  const { workspaceId } = useParams({ strict: false }) as {
    workspaceId?: Id<"workspace">;
  };

  return (
    <HomeCard className="mx-1 mb-1 overflow-hidden bg-center p-5 shadow-borders-base">
      <div className="flex items-start gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <Heading className="font-medium text-sm text-ui-fg-base">
            Let your library work for you
          </Heading>
          <Text className="font-medium text-ui-fg-muted" size="small">
            Upgrade to surface concept clusters, recent connections, and
            forgotten resources right on your home page - and lift your
            AI-action and storage caps.
          </Text>
          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={() =>
                navigate({
                  to: "/settings",
                  search: userSettingsSearch({
                    tab: "billing",
                    workspaceId,
                  }),
                })
              }
              size="small"
              variant="omi"
            >
              View plans
            </Button>
          </div>
        </div>
      </div>
    </HomeCard>
  );
}
