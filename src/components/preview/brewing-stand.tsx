import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";

const BrewingArrow = () => (
  <svg aria-hidden viewBox="0 0 9 16" className="fill-[#8b8b8b]" width={14} height={22}>
    <rect x="3.5" y="0" width="2" height="10" />
    <polygon points="4.5,16 0,10 9,10" />
  </svg>
);

export const BrewingStandPreview = () => {
  return (
    <div
      className="relative [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{
        width: 352,
        height: 192,
        background: "#c6c6c6",
        borderWidth: 4,
        borderStyle: "solid",
        borderColor: "#ffffff #555555 #555555 #ffffff",
      }}
    >
      {/* Title */}
      <div
        className="absolute select-none"
        style={{
          top: 6,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#404040",
          fontFamily: "'Courier New', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        Brewing Stand
      </div>

      {/* Reagent slot at top center */}
      <ItemPreviewDropTarget
        slot="brewing.reagent"
        style={{ position: "absolute", top: 26, left: 158 }}
      />

      {/* Down arrow from reagent to apparatus */}
      <div className="absolute flex justify-center" style={{ top: 64, left: 164, width: 24 }}>
        <BrewingArrow />
      </div>

      {/* Brewing stand apparatus */}
      <svg
        aria-hidden
        viewBox="0 0 140 48"
        className="absolute"
        style={{ top: 86, left: 106, width: 140, height: 48 }}
      >
        {/* Top horizontal bar */}
        <rect x="40" y="0" width="60" height="3" fill="#7a7a7a" />
        {/* Left diagonal arm to input bottle */}
        <line
          x1="44"
          y1="3"
          x2="14"
          y2="28"
          stroke="#7a7a7a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Right diagonal arm to output bottle */}
        <line
          x1="96"
          y1="3"
          x2="126"
          y2="28"
          stroke="#7a7a7a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Center vertical rod */}
        <rect x="68" y="0" width="3" height="38" fill="#7a7a7a" />
        {/* Base platform */}
        <rect x="56" y="40" width="28" height="5" rx="1" fill="#6b6b6b" />
        <rect x="60" y="36" width="20" height="5" rx="1" fill="#808080" />
        {/* Small circles at arm endpoints */}
        <circle cx="14" cy="30" r="3" fill="#6b6b6b" />
        <circle cx="126" cy="30" r="3" fill="#6b6b6b" />
      </svg>

      {/* Input slot (left bottle) */}
      <ItemPreviewDropTarget
        slot="brewing.input"
        style={{ position: "absolute", top: 140, left: 102 }}
      />

      {/* Output slot (right bottle) */}
      <ItemPreviewDropTarget
        slot="brewing.result"
        style={{ position: "absolute", top: 140, left: 214 }}
      />

      {/* Arrow between input and output */}
      <svg
        aria-hidden
        viewBox="0 0 22 15"
        className="absolute fill-[#8b8b8b]"
        style={{ top: 150, left: 148, width: 56, height: 16 }}
      >
        <path d="M14 0h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-6H0V6h14z" />
      </svg>

      {/* Labels */}
      <div
        className="absolute select-none text-center"
        style={{
          top: 178,
          left: 102,
          width: 36,
          color: "#606060",
          fontFamily: "'Courier New', monospace",
          fontSize: 8,
        }}
      >
        Input
      </div>
      <div
        className="absolute select-none"
        style={{
          top: 30,
          left: 196,
          color: "#606060",
          fontFamily: "'Courier New', monospace",
          fontSize: 8,
          lineHeight: "28px",
        }}
      >
        Reagent
      </div>
      <div
        className="absolute select-none text-center"
        style={{
          top: 178,
          left: 214,
          width: 36,
          color: "#606060",
          fontFamily: "'Courier New', monospace",
          fontSize: 8,
        }}
      >
        Output
      </div>
    </div>
  );
};
