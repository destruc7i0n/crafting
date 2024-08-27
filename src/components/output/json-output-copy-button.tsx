import { useState } from "react";

import { CircleCheckIcon } from "lucide-react";

type JsonButtonCopyButtonProps = {
  json: object;
};

export const JsonButtonCopyButton = ({ json }: JsonButtonCopyButtonProps) => {
  // store when the button is clicked for an animation
  const [clicked, setClicked] = useState(false);

  const onClick = () => {
    if (clicked) return;
    setClicked(true);
    navigator.clipboard.writeText(JSON.stringify(json));
    setTimeout(() => setClicked(false), 1000);
  };

  return (
    <button
      className="focus:outline-non p-2 text-xs text-gray-500 hover:text-gray-700"
      onClick={() => onClick()}
    >
      {clicked ? (
        <CircleCheckIcon
          className="text-green-700"
          color="currentColor"
          size={16}
        />
      ) : (
        "Copy"
      )}
    </button>
  );
};
