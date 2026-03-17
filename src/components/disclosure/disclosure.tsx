import { Popover } from "@/components/popover/popover";
import { Tooltip } from "@/components/tooltip/tooltip";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import type { Placement } from "@floating-ui/react";

type DisclosureProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
};

export const Disclosure = ({ content, children, placement = "right" }: DisclosureProps) => {
  const isTouchDevice = useIsTouchDevice();

  if (isTouchDevice) {
    return (
      <Popover content={content} placement={placement}>
        {children}
      </Popover>
    );
  }

  return (
    <Tooltip content={content} placement={placement}>
      {children}
    </Tooltip>
  );
};
