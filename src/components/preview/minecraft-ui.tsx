import { cn } from "@/lib/utils";

export function MinecraftUiLabel({ children, center }: { children: string; center?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "font-minecraft pointer-events-none text-[20px] leading-[18px] whitespace-nowrap text-[#404040] [-webkit-font-smoothing:none] select-none",
        center ? "text-center" : "text-left",
      )}
    >
      {children}
    </div>
  );
}

export function MinecraftUiFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute bg-[#c6c6c6]" style={{ top: 6, right: 6, bottom: 6, left: 6 }} />
      <div className="absolute bg-[#c6c6c6]" style={{ top: 4, right: 4, width: 2, height: 2 }} />
      <div className="absolute bg-[#c6c6c6]" style={{ bottom: 4, left: 4, width: 2, height: 2 }} />

      <div className="absolute bg-white" style={{ top: 2, right: 6, left: 4, height: 2 }} />
      <div className="absolute bg-white" style={{ top: 4, right: 6, left: 2, height: 2 }} />
      <div className="absolute bg-white" style={{ top: 6, left: 2, width: 6, height: 2 }} />
      <div className="absolute bg-white" style={{ top: 8, bottom: 6, left: 2, width: 4 }} />

      <div className="absolute bg-[#555555]" style={{ top: 6, right: 2, bottom: 8, width: 4 }} />
      <div className="absolute bg-[#555555]" style={{ right: 2, bottom: 6, width: 6, height: 2 }} />
      <div className="absolute bg-[#555555]" style={{ right: 2, bottom: 4, left: 6, height: 2 }} />
      <div className="absolute bg-[#555555]" style={{ right: 4, bottom: 2, left: 6, height: 2 }} />

      <div className="absolute bg-black" style={{ top: 0, right: 6, left: 4, height: 2 }} />
      <div className="absolute bg-black" style={{ top: 2, left: 2, width: 2, height: 2 }} />
      <div className="absolute bg-black" style={{ top: 2, right: 4, width: 2, height: 2 }} />
      <div className="absolute bg-black" style={{ top: 4, bottom: 6, left: 0, width: 2 }} />
      <div className="absolute bg-black" style={{ top: 4, right: 2, width: 2, height: 2 }} />
      <div className="absolute bg-black" style={{ top: 6, right: 0, bottom: 4, width: 2 }} />
      <div className="absolute bg-black" style={{ bottom: 4, left: 2, width: 2, height: 2 }} />
      <div className="absolute bg-black" style={{ bottom: 2, left: 4, width: 2, height: 2 }} />
      <div className="absolute bg-black" style={{ right: 2, bottom: 2, width: 2, height: 2 }} />
      <div className="absolute bg-black" style={{ right: 4, bottom: 0, left: 6, height: 2 }} />
    </div>
  );
}

export function CraftingArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 22 15"
      className="block h-full w-full"
      fill="#8b8b8b"
      shapeRendering="crispEdges"
    >
      <rect x="14" y="0" width="1" height="1" />
      <rect x="14" y="1" width="2" height="1" />
      <rect x="14" y="2" width="3" height="1" />
      <rect x="14" y="3" width="4" height="1" />
      <rect x="14" y="4" width="5" height="1" />
      <rect x="14" y="5" width="6" height="1" />
      <rect x="0" y="6" width="21" height="1" />
      <rect x="0" y="7" width="22" height="1" />
      <rect x="0" y="8" width="21" height="1" />
      <rect x="14" y="9" width="6" height="1" />
      <rect x="14" y="10" width="5" height="1" />
      <rect x="14" y="11" width="4" height="1" />
      <rect x="14" y="12" width="3" height="1" />
      <rect x="14" y="13" width="2" height="1" />
      <rect x="14" y="14" width="1" height="1" />
    </svg>
  );
}

export function FurnaceFire() {
  return (
    <svg
      aria-hidden
      viewBox="57 36 14 14"
      className="block h-full w-full"
      shapeRendering="crispEdges"
    >
      <path
        fill="#8B8B8B"
        d="M69 37h1v1H69zM69 38h1v1H69zM60 39h1v1H60zM60 40h1v1H60zM60 41h1v1H60zM65 41h1v1H65zM69 41h1v1H69zM60 42h1v1H60zM65 42h1v1H65zM60 43h1v1H60zM65 43h1v1H65zM70 43h1v1H70zM59 44h1v1H59zM65 44h1v1H65zM70 44h1v1H70zM64 45h2v1H64zM70 45h1v1H70zM60 46h1v1H60zM64 46h1v1H64zM70 46h1v1H70zM60 47h1v1H60zM69 47h1v1H69zM60 48h1v1H60zM65 48h1v1H65zM58 49h3v1H58zM63 49h3v1H63zM68 49h3v1H68z"
      />
      <path
        fill="#D84C45"
        d="M58 36h1v1H58zM68 36h1v1H68zM59 37h1v1H59zM63 37h1v1H63zM67 37h1v1H67zM58 39h1v1H58zM64 39h1v1H64zM68 39h1v1H68zM63 41h1v1H63zM57 42h1v1H57zM69 42h1v1H69zM59 43h1v1H59zM62 43h1v1H62zM67 43h1v1H67zM64 44h1v1H64zM57 46h1v1H57zM69 46h1v1H69z"
      />
      <path
        fill="#FFB600"
        d="M58 37h1v1H58zM68 37h1v1H68zM59 38h1v1H59zM63 38h1v1H63zM67 38h1v1H67zM58 40h1v1H58zM64 40h1v1H64zM68 40h1v1H68zM64 41h1v1H64zM59 42h1v1H59zM64 42h1v1H64zM67 42h1v1H67zM57 43h1v1H57zM69 43h1v1H69zM62 44h1v1H62zM59 45h1v1H59zM62 45h1v1H62zM67 45h1v1H67zM57 48h1v1H57zM59 48h1v1H59zM62 48h1v1H62zM67 48h1v1H67zM69 48h1v1H69z"
      />
      <path
        fill="#FFFF1F"
        d="M59 39h1v1H59zM63 39h1v1H63zM67 39h1v1H67zM59 40h1v1H59zM67 40h1v1H67zM58 41h1v1H58zM68 41h1v1H68zM58 42h1v1H58zM63 42h1v1H63zM68 42h1v1H68zM64 43h1v1H64zM68 43h1v1H68zM57 44h1v1H57zM63 44h1v1H63zM69 44h1v1H69zM69 45h1v1H69zM59 46h1v1H59zM62 46h1v1H62zM67 46h1v1H67zM62 47h1v1H62zM64 47h1v1H64z"
      />
      <path
        fill="#FFFFFF"
        d="M59 41h1v1H59zM67 41h1v1H67zM58 43h1v1H58zM63 43h1v1H63zM58 44h1v1H58zM68 44h1v1H68zM57 45h2v1H57zM63 45h1v1H63zM68 45h1v1H68zM58 46h1v1H58zM63 46h1v1H63zM68 46h1v1H68zM58 47h2v1H58zM63 47h1v1H63zM67 47h2v1H67zM58 48h1v1H58zM63 48h2v1H63zM68 48h1v1H68z"
      />
    </svg>
  );
}

export function StonecutterSelectionUi() {
  return (
    <svg
      aria-hidden
      viewBox="51 14 81 56"
      className="block h-full w-full"
      shapeRendering="crispEdges"
    >
      <path
        fill="#373737"
        d="M51 14h65v1H51zM118 14h13v1H118zM51 15h1v1H51zM118 15h1v1H118zM51 16h1v1H51zM118 16h1v1H118zM51 17h1v1H51zM118 17h1v1H118zM51 18h1v1H51zM118 18h1v1H118zM51 19h1v1H51zM118 19h1v1H118zM51 20h1v1H51zM118 20h1v1H118zM51 21h1v1H51zM118 21h1v1H118zM51 22h1v1H51zM118 22h1v1H118zM51 23h1v1H51zM118 23h1v1H118zM51 24h1v1H51zM118 24h1v1H118zM51 25h1v1H51zM118 25h1v1H118zM51 26h1v1H51zM118 26h1v1H118zM51 27h1v1H51zM118 27h1v1H118zM51 28h1v1H51zM118 28h1v1H118zM51 29h1v1H51zM118 29h1v1H118zM51 30h1v1H51zM118 30h1v1H118zM51 31h1v1H51zM118 31h1v1H118zM51 32h1v1H51zM118 32h1v1H118zM51 33h1v1H51zM118 33h1v1H118zM51 34h1v1H51zM118 34h1v1H118zM51 35h1v1H51zM118 35h1v1H118zM51 36h1v1H51zM118 36h1v1H118zM51 37h1v1H51zM118 37h1v1H118zM51 38h1v1H51zM118 38h1v1H118zM51 39h1v1H51zM118 39h1v1H118zM51 40h1v1H51zM118 40h1v1H118zM51 41h1v1H51zM118 41h1v1H118zM51 42h1v1H51zM118 42h1v1H118zM51 43h1v1H51zM118 43h1v1H118zM51 44h1v1H51zM118 44h1v1H118zM51 45h1v1H51zM118 45h1v1H118zM51 46h1v1H51zM118 46h1v1H118zM51 47h1v1H51zM118 47h1v1H118zM51 48h1v1H51zM118 48h1v1H118zM51 49h1v1H51zM118 49h1v1H118zM51 50h1v1H51zM118 50h1v1H118zM51 51h1v1H51zM118 51h1v1H118zM51 52h1v1H51zM118 52h1v1H118zM51 53h1v1H51zM118 53h1v1H118zM51 54h1v1H51zM118 54h1v1H118zM51 55h1v1H51zM118 55h1v1H118zM51 56h1v1H51zM118 56h1v1H118zM51 57h1v1H51zM118 57h1v1H118zM51 58h1v1H51zM118 58h1v1H118zM51 59h1v1H51zM118 59h1v1H118zM51 60h1v1H51zM118 60h1v1H118zM51 61h1v1H51zM118 61h1v1H118zM51 62h1v1H51zM118 62h1v1H118zM51 63h1v1H51zM118 63h1v1H118zM51 64h1v1H51zM118 64h1v1H118zM51 65h1v1H51zM118 65h1v1H118zM51 66h1v1H51zM118 66h1v1H118zM51 67h1v1H51zM118 67h1v1H118zM51 68h1v1H51zM118 68h1v1H118z"
      />
      <path
        fill="#51493A"
        d="M116 14h1v1H116zM52 15h64v1H52zM52 16h64v1H52zM52 17h64v1H52zM52 18h64v1H52zM52 19h64v1H52zM52 20h64v1H52zM52 21h64v1H52zM52 22h64v1H52zM52 23h64v1H52zM52 24h64v1H52zM52 25h64v1H52zM52 26h64v1H52zM52 27h64v1H52zM52 28h64v1H52zM52 29h64v1H52zM52 30h64v1H52zM52 31h64v1H52zM52 32h64v1H52zM52 33h64v1H52zM52 34h64v1H52zM52 35h64v1H52zM52 36h64v1H52zM52 37h64v1H52zM52 38h64v1H52zM52 39h64v1H52zM52 40h64v1H52zM52 41h64v1H52zM52 42h64v1H52zM52 43h64v1H52zM52 44h64v1H52zM52 45h64v1H52zM52 46h64v1H52zM52 47h64v1H52zM52 48h64v1H52zM52 49h64v1H52zM52 50h64v1H52zM52 51h64v1H52zM52 52h64v1H52zM52 53h64v1H52zM52 54h64v1H52zM52 55h64v1H52zM52 56h64v1H52zM52 57h64v1H52zM52 58h64v1H52zM52 59h64v1H52zM52 60h64v1H52zM52 61h64v1H52zM52 62h64v1H52zM52 63h64v1H52zM52 64h64v1H52zM52 65h64v1H52zM52 66h64v1H52zM52 67h64v1H52zM52 68h64v1H52zM51 69h1v1H51z"
      />
      <path
        fill="#6B614C"
        d="M116 15h1v1H116zM116 16h1v1H116zM116 17h1v1H116zM116 18h1v1H116zM116 19h1v1H116zM116 20h1v1H116zM116 21h1v1H116zM116 22h1v1H116zM116 23h1v1H116zM116 24h1v1H116zM116 25h1v1H116zM116 26h1v1H116zM116 27h1v1H116zM116 28h1v1H116zM116 29h1v1H116zM116 30h1v1H116zM116 31h1v1H116zM116 32h1v1H116zM116 33h1v1H116zM116 34h1v1H116zM116 35h1v1H116zM116 36h1v1H116zM116 37h1v1H116zM116 38h1v1H116zM116 39h1v1H116zM116 40h1v1H116zM116 41h1v1H116zM116 42h1v1H116zM116 43h1v1H116zM116 44h1v1H116zM116 45h1v1H116zM116 46h1v1H116zM116 47h1v1H116zM116 48h1v1H116zM116 49h1v1H116zM116 50h1v1H116zM116 51h1v1H116zM116 52h1v1H116zM116 53h1v1H116zM116 54h1v1H116zM116 55h1v1H116zM116 56h1v1H116zM116 57h1v1H116zM116 58h1v1H116zM116 59h1v1H116zM116 60h1v1H116zM116 61h1v1H116zM116 62h1v1H116zM116 63h1v1H116zM116 64h1v1H116zM116 65h1v1H116zM116 66h1v1H116zM116 67h1v1H116zM116 68h1v1H116zM52 69h65v1H52z"
      />
      <path
        fill="#8B8B8B"
        d="M131 14h1v1H131zM119 15h12v1H119zM119 16h12v1H119zM119 17h12v1H119zM119 18h12v1H119zM119 19h12v1H119zM119 20h12v1H119zM119 21h12v1H119zM119 22h12v1H119zM119 23h12v1H119zM119 24h12v1H119zM119 25h12v1H119zM119 26h12v1H119zM119 27h12v1H119zM119 28h12v1H119zM119 29h12v1H119zM119 30h12v1H119zM119 31h12v1H119zM119 32h12v1H119zM119 33h12v1H119zM119 34h12v1H119zM119 35h12v1H119zM119 36h12v1H119zM119 37h12v1H119zM119 38h12v1H119zM119 39h12v1H119zM119 40h12v1H119zM119 41h12v1H119zM119 42h12v1H119zM119 43h12v1H119zM119 44h12v1H119zM119 45h12v1H119zM119 46h12v1H119zM119 47h12v1H119zM119 48h12v1H119zM119 49h12v1H119zM119 50h12v1H119zM119 51h12v1H119zM119 52h12v1H119zM119 53h12v1H119zM119 54h12v1H119zM119 55h12v1H119zM119 56h12v1H119zM119 57h12v1H119zM119 58h12v1H119zM119 59h12v1H119zM119 60h12v1H119zM119 61h12v1H119zM119 62h12v1H119zM119 63h12v1H119zM119 64h12v1H119zM119 65h12v1H119zM119 66h12v1H119zM119 67h12v1H119zM119 68h12v1H119zM118 69h1v1H118z"
      />
      <path
        fill="#FFFFFF"
        d="M131 15h1v1H131zM131 16h1v1H131zM131 17h1v1H131zM131 18h1v1H131zM131 19h1v1H131zM131 20h1v1H131zM131 21h1v1H131zM131 22h1v1H131zM131 23h1v1H131zM131 24h1v1H131zM131 25h1v1H131zM131 26h1v1H131zM131 27h1v1H131zM131 28h1v1H131zM131 29h1v1H131zM131 30h1v1H131zM131 31h1v1H131zM131 32h1v1H131zM131 33h1v1H131zM131 34h1v1H131zM131 35h1v1H131zM131 36h1v1H131zM131 37h1v1H131zM131 38h1v1H131zM131 39h1v1H131zM131 40h1v1H131zM131 41h1v1H131zM131 42h1v1H131zM131 43h1v1H131zM131 44h1v1H131zM131 45h1v1H131zM131 46h1v1H131zM131 47h1v1H131zM131 48h1v1H131zM131 49h1v1H131zM131 50h1v1H131zM131 51h1v1H131zM131 52h1v1H131zM131 53h1v1H131zM131 54h1v1H131zM131 55h1v1H131zM131 56h1v1H131zM131 57h1v1H131zM131 58h1v1H131zM131 59h1v1H131zM131 60h1v1H131zM131 61h1v1H131zM131 62h1v1H131zM131 63h1v1H131zM131 64h1v1H131zM131 65h1v1H131zM131 66h1v1H131zM131 67h1v1H131zM131 68h1v1H131zM119 69h13v1H119z"
      />
    </svg>
  );
}

export function SmithingHammer() {
  return (
    <svg
      aria-hidden
      viewBox="7 7 30 31"
      className="block h-full w-full"
      shapeRendering="crispEdges"
    >
      <path
        fill="#06070D"
        d="M21 7h2v1H21zM21 8h2v1H21zM19 9h2v1H19zM23 9h2v1H23zM19 10h2v1H19zM23 10h2v1H23zM17 11h2v1H17zM25 11h2v1H25zM29 11h4v1H29zM17 12h2v1H17zM25 12h2v1H25zM29 12h4v1H29zM15 13h2v1H15zM27 13h2v1H27zM31 13h2v1H31zM15 14h2v1H15zM27 14h2v1H27zM31 14h2v1H31zM17 15h2v1H17zM29 15h2v1H29zM17 16h2v1H17zM29 16h2v1H29zM19 17h2v1H19zM31 17h2v1H31zM19 18h2v1H19zM31 18h2v1H31zM21 19h2v1H21zM33 19h2v1H33zM21 20h2v1H21zM33 20h2v1H33zM19 21h2v1H19zM23 21h2v1H23zM35 21h2v1H35zM19 22h2v1H19zM23 22h2v1H23zM35 22h2v1H35zM19 23h2v1H19zM23 23h2v1H23zM35 23h2v1H35zM17 24h2v1H17zM21 24h2v1H21zM25 24h2v1H25zM33 24h2v1H33zM17 25h2v1H17zM21 25h2v1H21zM25 25h2v1H25zM33 25h2v1H33zM15 26h2v1H15zM19 26h2v1H19zM27 26h2v1H27zM31 26h2v1H31zM15 27h2v1H15zM19 27h2v1H19zM27 27h2v1H27zM31 27h2v1H31zM13 28h2v1H13zM17 28h2v1H17zM29 28h2v1H29zM13 29h2v1H13zM17 29h2v1H17zM29 29h2v1H29zM11 30h2v1H11zM15 30h2v1H15zM11 31h2v1H11zM15 31h2v1H15zM9 32h2v1H9zM13 32h2v1H13zM9 33h2v1H9zM13 33h2v1H13zM7 34h2v1H7zM11 34h2v1H11zM7 35h2v1H7zM11 35h2v1H11zM7 36h4v1H7zM7 37h4v1H7z"
      />
      <path
        fill="#202129"
        d="M19 13h2v1H19zM19 14h2v1H19zM19 15h4v1H19zM19 16h4v1H19zM21 17h4v1H21zM21 18h4v1H21zM23 19h4v1H23zM23 20h4v1H23zM25 21h4v1H25zM25 22h4v1H25zM25 23h4v1H25zM27 24h4v1H27zM27 25h4v1H27z"
      />
      <path
        fill="#2E2F38"
        d="M21 9h2v1H21zM21 10h2v1H21zM19 11h6v1H19zM19 12h6v1H19zM21 13h6v1H21zM21 14h6v1H21zM23 15h2v1H23zM27 15h2v1H27zM23 16h2v1H23zM27 16h2v1H27zM25 17h2v1H25zM29 17h2v1H29zM25 18h2v1H25zM29 18h2v1H29zM27 19h2v1H27zM27 20h2v1H27zM29 21h2v1H29zM29 22h2v1H29zM29 23h2v1H29z"
      />
      <path
        fill="#3D3E48"
        d="M25 15h2v1H25zM25 16h2v1H25zM31 19h2v1H31zM31 20h2v1H31zM33 21h2v1H33zM33 22h2v1H33zM33 23h2v1H33zM31 24h2v1H31zM31 25h2v1H31zM29 26h2v1H29zM29 27h2v1H29z"
      />
      <path fill="#3E2316" d="M21 21h2v1H21zM21 22h2v1H21zM21 23h2v1H21z" />
      <path fill="#4C2D1E" d="M19 24h2v1H19zM19 25h2v1H19z" />
      <path fill="#51525B" d="M17 13h2v1H17zM17 14h2v1H17z" />
      <path
        fill="#565868"
        d="M27 17h2v1H27zM27 18h2v1H27zM31 21h2v1H31zM31 22h2v1H31zM31 23h2v1H31z"
      />
      <path
        fill="#593828"
        d="M17 26h2v1H17zM17 27h2v1H17zM11 32h2v1H11zM11 33h2v1H11zM9 34h2v1H9zM9 35h2v1H9z"
      />
      <path fill="#6A4534" d="M29 13h2v1H29zM29 14h2v1H29z" />
      <path fill="#804C33" d="M15 28h2v1H15zM15 29h2v1H15zM13 30h2v1H13zM13 31h2v1H13z" />
      <path fill="#82ADB7" d="M29 19h2v1H29zM29 20h2v1H29z" />
    </svg>
  );
}
