import { Refractor, registerLanguage } from "react-refractor";
import json from "refractor/json";

registerLanguage(json);

type JsonOutputProps = {
  json: object;
};

export const JsonOutput = ({ json }: JsonOutputProps) => {
  const preview = JSON.stringify(json, null, 2);

  return (
    <Refractor
      language="json"
      value={preview}
      className="json-refractor !m-0 overflow-x-auto !rounded-lg !rounded-t-none p-3 text-sm"
    />
  );
};
