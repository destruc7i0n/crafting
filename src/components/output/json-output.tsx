import { Refractor, registerLanguage } from "react-refractor";
import json from "refractor/lang/json";

registerLanguage(json);

type JsonOutputProps = {
  json: string;
};

export const JsonOutput = ({ json }: JsonOutputProps) => {
  return <Refractor language="json" value={json} />;
};
