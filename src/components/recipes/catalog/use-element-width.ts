import { useLayoutEffect, useState, type RefObject } from "react";

export function useElementWidth(ref: RefObject<HTMLElement | null>, fallbackWidth: number) {
  const [width, setWidth] = useState(fallbackWidth);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(element);
    setWidth(element.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}

export function useElementScrollMargin(ref: RefObject<HTMLElement | null>) {
  const [scrollMargin, setScrollMargin] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const measureScrollMargin = () => {
      setScrollMargin(element.getBoundingClientRect().top + window.scrollY);
    };

    const observer = new ResizeObserver(measureScrollMargin);
    observer.observe(element);
    measureScrollMargin();
    window.addEventListener("resize", measureScrollMargin);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureScrollMargin);
    };
  }, [ref]);

  return scrollMargin;
}
