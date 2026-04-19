const Punctuation = ({ c }: { c: string }) => <span className="token punctuation">{c}</span>;
const indent = (depth: number) => "  ".repeat(depth);

const JsonValue = ({ value, depth }: { value: unknown; depth: number }) => {
  if (value === null) return <span className="token null keyword">null</span>;

  if (typeof value === "boolean") return <span className="token boolean">{String(value)}</span>;

  if (typeof value === "number") {
    if (!isFinite(value)) return <span className="token null keyword">null</span>;
    return <span className="token number">{value}</span>;
  }

  if (typeof value === "string")
    return <span className="token string">{JSON.stringify(value)}</span>;

  if (Array.isArray(value)) {
    const items = value.filter((item) => item !== undefined);
    if (items.length === 0)
      return (
        <>
          <Punctuation c="[" />
          <Punctuation c="]" />
        </>
      );
    return (
      <>
        <Punctuation c="[" />
        {"\n"}
        {items.map((item, i) => (
          <span key={i}>
            {indent(depth + 1)}
            <JsonValue value={item} depth={depth + 1} />
            {i < items.length - 1 && <Punctuation c="," />}
            {"\n"}
          </span>
        ))}
        {indent(depth)}
        <Punctuation c="]" />
      </>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    );
    if (entries.length === 0)
      return (
        <>
          <Punctuation c="{" />
          <Punctuation c="}" />
        </>
      );
    return (
      <>
        <Punctuation c="{" />
        {"\n"}
        {entries.map(([k, v], i) => (
          <span key={k}>
            {indent(depth + 1)}
            <span className="token property">{JSON.stringify(k)}</span>
            <Punctuation c=":" /> <JsonValue value={v} depth={depth + 1} />
            {i < entries.length - 1 && <Punctuation c="," />}
            {"\n"}
          </span>
        ))}
        {indent(depth)}
        <Punctuation c="}" />
      </>
    );
  }

  return null;
};

type JsonOutputProps = {
  json: object;
};

export const JsonOutput = ({ json }: JsonOutputProps) => (
  <pre className="language-json scrollbar-app scrollbar-app-thin m-0! overflow-x-auto rounded-lg! rounded-t-none! p-3 text-sm">
    <code>
      <JsonValue value={json} depth={0} />
    </code>
  </pre>
);
