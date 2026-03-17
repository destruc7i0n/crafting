import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { computePosition, type Placement } from "@/lib/popup-position";

type PopoverProps = {
  content: string;
  children: React.ReactNode;
  placement?: Placement;
};

export const Popover = ({ content, children, placement = "right" }: PopoverProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    const rect = trigger.getBoundingClientRect();
    const { width: popoverWidth, height: popoverHeight } = popover.getBoundingClientRect();

    setPosition(computePosition(placement, rect, popoverWidth, popoverHeight));
  }, [isOpen, placement]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
      setPosition(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  return (
    <div
      ref={triggerRef}
      onClick={() => {
        if (isOpen) {
          setIsOpen(false);
          setPosition(null);
        } else {
          setIsOpen(true);
        }
      }}
    >
      {children}

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="border-border bg-popover text-popover-foreground fixed z-50 max-w-72 rounded-md border px-2.5 py-1.5 text-xs leading-snug shadow-md"
            style={
              position ? { top: `${position.top}px`, left: `${position.left}px` } : { opacity: 0 }
            }
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
};
