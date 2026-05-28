import { Button } from "@omi/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@omi/ui/dropdown-menu";
import { Input } from "@omi/ui/input";
import {
  RiArrowDownFill,
  RiArrowUpDownFill,
  RiFileFill,
  RiFilter3Fill,
  RiFolderAddFill,
  RiGlobeFill,
  RiStickyNoteFill,
  RiTimeFill,
} from "@remixicon/react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

const TYPE_VALUES = ["website", "note", "file"] as const;
const ORDER_VALUES = ["newest", "oldest", "alphabetical"] as const;

const TYPE_OPTIONS = [
  { value: null, label: "All types", icon: null },
  { value: "website" as const, label: "Websites", icon: RiGlobeFill },
  { value: "note" as const, label: "Notes", icon: RiStickyNoteFill },
  { value: "file" as const, label: "Files", icon: RiFileFill },
] as const;

const ORDER_OPTIONS = [
  { value: null, label: "Newest", icon: RiTimeFill },
  { value: "oldest" as const, label: "Oldest", icon: RiTimeFill },
  {
    value: "alphabetical" as const,
    label: "Alphabetical",
    icon: RiArrowDownFill,
  },
] as const;

export function useLibraryFilters() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [type, setType] = useQueryState(
    "type",
    parseAsStringLiteral(TYPE_VALUES).withOptions({ shallow: false })
  );
  const [order, setOrder] = useQueryState(
    "order",
    parseAsStringLiteral(ORDER_VALUES).withOptions({ shallow: false })
  );

  return { search, setSearch, type, setType, order, setOrder };
}

export function LibraryToolbar({
  onCreateCollection,
}: {
  onCreateCollection?: () => void;
}) {
  const { search, setSearch, type, setType, order, setOrder } =
    useLibraryFilters();

  const _activeTypeLabel =
    TYPE_OPTIONS.find((o) => o.value === type)?.label ?? "All types";
  const _activeOrderLabel =
    ORDER_OPTIONS.find((o) => o.value === order)?.label ?? "Newest";

  return (
    <div className="fixed inset-x-2 top-10 z-30 flex items-center gap-x-2 rounded-t-2xl bg-ui-bg-base! p-2 md:sticky md:inset-x-auto md:top-0 md:w-full md:rounded-t-lg">
      <Input
        className="w-48 rounded-md bg-ui-bg-field-component-hover hover:bg-ui-bg-component-hover dark:bg-ui-bg-field-component dark:hover:bg-ui-bg-field-component-hover"
        onChange={(e) => setSearch(e.target.value || null)}
        placeholder="Search"
        type="search"
        value={search}
      />
      <div className="ml-auto flex items-center gap-x-2">
        {onCreateCollection && (
          <Button
            className="size-8! shrink-0"
            onClick={onCreateCollection}
            variant="secondary"
          >
            <RiFolderAddFill className="size-4 shrink-0" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                className="size-8 h-8 gap-x-1.5 px-3 text-xs"
                variant="secondary"
              />
            }
          >
            <RiFilter3Fill className="size-3.5 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TYPE_OPTIONS.map((option) => (
              <DropdownMenuItem
                className="[&_svg]:text-ui-fg-subtle hover:[&_svg]:text-ui-fg-base"
                key={option.label}
                onClick={() => setType(option.value)}
              >
                {option.icon && <option.icon className="h-4 w-4" />}
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                className="size-8! h-8 gap-x-1.5 whitespace-nowrap px-3 text-xs"
                variant="secondary"
              />
            }
          >
            <RiArrowUpDownFill className="size-3.5 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ORDER_OPTIONS.map((option) => (
              <DropdownMenuItem
                className="[&_svg]:text-ui-fg-subtle hover:[&_svg]:text-ui-fg-base"
                key={option.label}
                onClick={() => setOrder(option.value)}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
