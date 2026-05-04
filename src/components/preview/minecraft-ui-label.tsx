type MinecraftUiLabelProps = {
  children: string;
  top: number;
  left?: number;
  center?: boolean;
};

export const MinecraftUiLabel = ({ children, top, left, center }: MinecraftUiLabelProps) => (
  <span
    aria-hidden="true"
    className="font-minecraft pointer-events-none absolute z-[1] text-[20px] leading-[18px] text-[#404040] [-webkit-font-smoothing:none] select-none"
    style={{
      top,
      ...(center ? { left: "50%", transform: "translateX(-50%)" } : { left }),
    }}
  >
    {children}
  </span>
);
