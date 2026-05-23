"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cn } from "@omi/ui";
import { RiArrowRightSFill, RiCheckFill, RiCircleFill } from "@remixicon/react";
import type * as React from "react";

function Menu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function MenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function MenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function MenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function MenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuRoot>) {
  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
  );
}

function MenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function MenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      className={cn(
        "txt-compact-small group/menuitem relative flex cursor-pointer select-none items-center rounded-md bg-ui-bg-component py-1.5 pl-2 font-medium text-ui-fg-subtle outline-none transition-colors [&_svg]:mr-2 [&_svg]:size-4 [&_svg]:text-ui-fg-base",
        "hover:bg-ui-bg-component-hover hover:text-ui-fg-base focus:bg-ui-bg-component-hover focus:text-ui-fg-base focus-visible:bg-ui-bg-component-hover data-highlighted:bg-ui-bg-component-hover data-popup-open:bg-ui-bg-component-hover data-highlighted:text-ui-fg-base data-popup-open:text-ui-fg-base [&_svg]:text-ui-fg-subtle hover:[&_svg]:text-ui-fg-base focus:[&_svg]:text-ui-fg-base",
        "active:bg-ui-bg-component-hover",
        "data-disabled:pointer-events-none data-disabled:text-ui-fg-disabled data-disabled:[&_svg]:text-ui-fg-disabled",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-sub-trigger"
      {...props}
    >
      {children}
      <RiArrowRightSFill className="ml-auto opacity-80" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function MenuContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Popup>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className="z-50"
        data-slot="context-menu-positioner"
      >
        <ContextMenuPrimitive.Popup
          className={cn(
            "relative flex not-[class*='w-']:min-w-52 origin-(--transform-origin) rounded-lg bg-ui-bg-component not-dark:bg-clip-padding shadow-elevation-flyout outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus:outline-none",
            className
          )}
          data-slot="context-menu-content"
          {...props}
        >
          <div className="max-h-(--available-height) w-full overflow-y-auto overflow-x-hidden p-1">
            {children}
          </div>
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function MenuSubContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Popup>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        align="start"
        alignOffset={-5}
        className="z-50"
        data-slot="context-menu-sub-positioner"
        side="inline-end"
        sideOffset={0}
      >
        <ContextMenuPrimitive.Popup
          className={cn(
            "relative flex not-[class*='w-']:min-w-52 origin-(--transform-origin) rounded-lg bg-ui-bg-component not-dark:bg-clip-padding shadow-elevation-flyout outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] focus:outline-none",
            className
          )}
          data-slot="context-menu-sub-content"
          {...props}
        >
          <div className="max-h-(--available-height) w-full overflow-y-auto overflow-x-hidden p-1">
            {children}
          </div>
        </ContextMenuPrimitive.Popup>
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function MenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        "txt-compact-small group/menuitem relative flex cursor-pointer select-none items-center rounded-md bg-ui-bg-component px-2 py-1.5 font-medium text-ui-fg-subtle outline-none transition-colors [&_svg]:mr-2 [&_svg]:size-4 [&_svg]:text-ui-fg-base",
        "hover:bg-ui-bg-component-hover hover:text-ui-fg-base focus:bg-ui-bg-component-hover focus:text-ui-fg-base focus-visible:bg-ui-bg-component-hover data-highlighted:bg-ui-bg-component-hover data-highlighted:text-ui-fg-base [&_svg]:text-ui-fg-subtle hover:[&_svg]:text-ui-fg-base focus:[&_svg]:text-ui-fg-base data-highlighted:[&_svg]:text-ui-fg-base",
        "active:bg-ui-bg-component-hover",
        "data-disabled:pointer-events-none data-disabled:text-ui-fg-disabled data-disabled:[&_svg]:text-ui-fg-disabled",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

function MenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(
        "txt-compact-small group/menuitem relative flex cursor-pointer select-none items-center rounded-md bg-ui-bg-component py-1.5 pr-2 pl-[31px] font-medium text-ui-fg-subtle outline-none transition-colors",
        "hover:bg-ui-bg-component-hover hover:text-ui-fg-base focus:bg-ui-bg-component-hover focus:text-ui-fg-base focus-visible:bg-ui-bg-component-hover data-highlighted:bg-ui-bg-component-hover data-highlighted:text-ui-fg-base",
        "active:bg-ui-bg-component-hover",
        "data-disabled:pointer-events-none data-disabled:text-ui-fg-disabled",
        "data-[state=checked]:text-ui-fg-base",
        className
      )}
      data-slot="context-menu-checkbox-item"
      {...props}
    >
      <span className="absolute left-2 flex size-[15px] items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <RiCheckFill className="size-4" />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function MenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      className={cn(
        "txt-compact-small group/menuitem relative flex cursor-pointer select-none items-center rounded-md bg-ui-bg-component py-1.5 pr-2 pl-[31px] font-medium text-ui-fg-subtle outline-none transition-colors",
        "hover:bg-ui-bg-component-hover hover:text-ui-fg-base focus:bg-ui-bg-component-hover focus:text-ui-fg-base focus-visible:bg-ui-bg-component-hover data-highlighted:bg-ui-bg-component-hover data-highlighted:text-ui-fg-base",
        "active:bg-ui-bg-component-hover",
        "data-disabled:pointer-events-none data-disabled:text-ui-fg-disabled",
        "data-[state=checked]:text-ui-fg-base",
        className
      )}
      data-slot="context-menu-radio-item"
      {...props}
    >
      <span className="absolute left-2 flex size-[15px] items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <RiCircleFill className="size-2 text-ui-fg-base" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function MenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.GroupLabel
      className={cn(
        "px-2 py-1.5 font-medium text-muted-foreground text-xs data-inset:ps-9 sm:data-inset:ps-8",
        className
      )}
      data-inset={inset}
      data-slot="context-menu-label"
      {...props}
    />
  );
}

function MenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("-mx-2 my-1 h-px bg-ui-fg-muted/10", className)}
      data-slot="context-menu-separator"
      {...props}
    />
  );
}

function MenuShortcut({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
        className
      )}
      data-slot="context-menu-shortcut"
      {...props}
    />
  );
}

const ContextMenu = Object.assign(Menu, {
  Trigger: MenuTrigger,
  Group: MenuGroup,
  Portal: MenuPortal,
  Sub: MenuSub,
  RadioGroup: MenuRadioGroup,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioItem: MenuRadioItem,
  Label: MenuLabel,
  Separator: MenuSeparator,
  Shortcut: MenuShortcut,
});

export { ContextMenu };
