import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";

const BrewingArrow = () => (
  <svg aria-hidden viewBox="0 0 9 16" className="fill-[#8b8b8b]" width={14} height={24}>
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
          top: 5,
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

      {/* Down arrow from reagent */}
      <div className="absolute flex justify-center" style={{ top: 64, left: 164, width: 24 }}>
        <BrewingArrow />
      </div>

      {/* Brewing stand apparatus - SVG drawing */}
      <svg
        aria-hidden
        viewBox="0 0 160 54"
        className="absolute"
        style={{ top: 88, left: 96, width: 160, height: 54 }}
      >
        {/* Top horizontal bar */}
        <rect x="52" y="0" width="56" height="3" fill="#7a7a7a" />
        {/* Left diagonal arm */}
        <line x1="56" y1="3" x2="20" y2="32" stroke="#7a7a7a" strokeWidth="3" strokeLinecap="round" />
        {/* Center vertical arm */}
        <line x1="80" y1="3" x2="80" y2="32" stroke="#7a7a7a" strokeWidth="3" />
        {/* Right diagonal arm */}
        <line x1="104" y1="3" x2="140" y2="32" stroke="#7a7a7a" strokeWidth="3" strokeLinecap="round" />
        {/* Base */}
        <rect x="64" y="44" width="32" height="5" rx="1" fill="#6b6b6b" />
        <rect x="70" y="40" width="20" height="5" rx="1" fill="#808080" />
        {/* Small circles at arm ends */}
        <circle cx="20" cy="34" r="3" fill="#6b6b6b" />
        <circle cx="80" cy="34" r="3" fill="#6b6b6b" />
        <circle cx="140" cy="34" r="3" fill="#6b6b6b" />
      </svg>

      {/* Input bottle slot - left */}
      <ItemPreviewDropTarget
        slot="brewing.input"
        style={{ position: "absolute", top: 138, left: 98 }}
      />

      {/* Output/result slot - right */}
      <ItemPreviewDropTarget
        slot="brewing.result"
        style={{ position: "absolute", top: 138, left: 218 }}
      />

      {/* Slot labels */}
      <div
        className="absolute select-none text-center"
        style={{
          top: 138,
          left: 134,
          width: 84,
          color: "#404040",
          fontFamily: "'Courier New', monospace",
          fontSize: 9,
          lineHeight: "36px",
        }}
      >
        →
      </div>
      <div
        className="absolute select-none text-center"
        style={{
          top: 176,
          left: 98,
          width: 36,
          color: "#606060",
          fontFamily: "'Courier New', monospace",
          fontSize: 8,
        }}
      >
        Input
      </div>
      <div
        className="absolute select-none text-center"
        style={{
          top: 176,
          left: 218,
          width: 36,
          color: "#606060",
          fontFamily: "'Courier New', monospace",
          fontSize: 8,
        }}
      >
        Output
      </div>
      <div
        className="absolute select-none text-center"
        style={{
          top: 26,
          left: 196,
          width: 50,
          color: "#606060",
          fontFamily: "'Courier New', monospace",
          fontSize: 8,
          lineHeight: "36px",
        }}
      >
        Reagent
      </div>
    </div>
  );
};
