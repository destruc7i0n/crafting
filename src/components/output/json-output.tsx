import { Refractor, registerLanguage } from "react-refractor";
import json from "refractor/lang/json";

import { JsonButtonCopyButton } from "./json-output-copy-button";

registerLanguage(json);

type JsonOutputProps = {
  json: object;
};

export const JsonOutput = ({ json }: JsonOutputProps) => {
  const preview = JSON.stringify(json, null, 2);

  return (
    <div className="relative">
      <Refractor
        language="json"
        value={preview}
        className="!m-0 overflow-x-auto"
      />

      <div className="absolute right-0 top-0">
        <JsonButtonCopyButton json={json} />
      </div>
    </div>
  );
};
