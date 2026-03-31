import { parseStringToMinecraftIdentifier } from "@/data/models/identifier/utilities";
import { MinecraftIdentifier } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

const BASE_IDENTIFIER_CHARACTERS = "a-z0-9_";
const JAVA_NAMESPACE_CHARACTERS = `${BASE_IDENTIFIER_CHARACTERS}.\\-`;
const JAVA_PATH_CHARACTERS = `${JAVA_NAMESPACE_CHARACTERS}/`;
const BEDROCK_IDENTIFIER_CHARACTERS = BASE_IDENTIFIER_CHARACTERS;

const WHITESPACE_PATTERN = /\s+/g;
const REPEATED_UNDERSCORE_PATTERN = /_+/g;
const EDGE_UNDERSCORE_PATTERN = /^_+|_+$/g;

const createAllowedPattern = (characters: string) => new RegExp(`^[${characters}]+$`);
const createInvalidPattern = (characters: string) => new RegExp(`[^${characters}]+`, "g");

const JAVA_NAMESPACE_PATTERN = createAllowedPattern(JAVA_NAMESPACE_CHARACTERS);
const JAVA_PATH_PATTERN = createAllowedPattern(JAVA_PATH_CHARACTERS);
const BEDROCK_IDENTIFIER_PATTERN = createAllowedPattern(BEDROCK_IDENTIFIER_CHARACTERS);

const JAVA_NAMESPACE_INVALID_PATTERN = createInvalidPattern(JAVA_NAMESPACE_CHARACTERS);
const JAVA_PATH_INVALID_PATTERN = createInvalidPattern(JAVA_PATH_CHARACTERS);
const BEDROCK_IDENTIFIER_INVALID_PATTERN = createInvalidPattern(BEDROCK_IDENTIFIER_CHARACTERS);

export const javaIdentifierNamespaceHint = "a-z, 0-9, _, ., -";
export const javaIdentifierPathHint = "a-z, 0-9, _, ., -, /";
export const bedrockIdentifierHint = "a-z, 0-9, _";
export const javaNamespacedIdentifierHint = "Use namespace:path";

const isValidIdentifierPart = (value: string, pattern: RegExp) => {
  const trimmed = value.trim();

  return trimmed.length > 0 && pattern.test(trimmed);
};

const sanitizeIdentifierPart = (value: string, invalidPattern: RegExp) =>
  value
    .trim()
    .toLowerCase()
    .replace(invalidPattern, "_")
    .replace(REPEATED_UNDERSCORE_PATTERN, "_")
    .replace(EDGE_UNDERSCORE_PATTERN, "");

const normalizeIdentifierPart = (value: string, invalidPattern: RegExp) =>
  value.trim().replace(WHITESPACE_PATTERN, "_").toLowerCase().replace(invalidPattern, "");

const normalizeIdentifierPartByVersion = (
  value: string,
  version: MinecraftVersion,
  isPath: boolean,
) => {
  if (version === MinecraftVersion.Bedrock) {
    return normalizeIdentifierPart(value, BEDROCK_IDENTIFIER_INVALID_PATTERN);
  }

  return normalizeIdentifierPart(
    value,
    isPath ? JAVA_PATH_INVALID_PATTERN : JAVA_NAMESPACE_INVALID_PATTERN,
  );
};

const splitNamespacedIdentifier = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(":");

  if (parts.length !== 2) {
    return null;
  }

  return { namespace: parts[0], path: parts[1] };
};

const isValidNamespacedIdentifierWith = (
  value: string,
  namespaceValidator: (value: string) => boolean,
  pathValidator: (value: string) => boolean,
) => {
  const parts = splitNamespacedIdentifier(value);

  return parts !== null && namespaceValidator(parts.namespace) && pathValidator(parts.path);
};

export const sanitizeJavaIdentifierNamespace = (value: string) =>
  sanitizeIdentifierPart(value, JAVA_NAMESPACE_INVALID_PATTERN);

export const sanitizeJavaIdentifierPath = (value: string) =>
  sanitizeIdentifierPart(value, JAVA_PATH_INVALID_PATTERN);

export const sanitizeBedrockIdentifierPart = (value: string) =>
  sanitizeIdentifierPart(value, BEDROCK_IDENTIFIER_INVALID_PATTERN);

export const isValidJavaIdentifierNamespace = (value: string) =>
  isValidIdentifierPart(value, JAVA_NAMESPACE_PATTERN);

export const isValidJavaIdentifierPath = (value: string) =>
  isValidIdentifierPart(value, JAVA_PATH_PATTERN);

export const isValidBedrockIdentifierPart = (value: string) =>
  isValidIdentifierPart(value, BEDROCK_IDENTIFIER_PATTERN);

export const isValidJavaNamespacedIdentifier = (value: string) =>
  isValidNamespacedIdentifierWith(value, isValidJavaIdentifierNamespace, isValidJavaIdentifierPath);

export const isValidBedrockNamespacedIdentifier = (value: string) =>
  isValidNamespacedIdentifierWith(
    value,
    isValidBedrockIdentifierPart,
    isValidBedrockIdentifierPart,
  );

export const isValidNamespacedIdentifier = (value: string, version: MinecraftVersion) =>
  version === MinecraftVersion.Bedrock
    ? isValidBedrockNamespacedIdentifier(value)
    : isValidJavaNamespacedIdentifier(value);

export const parseMinecraftIdentifierInput = (
  value: string,
  version: MinecraftVersion,
  defaultNamespace = "minecraft",
): MinecraftIdentifier => {
  const parts = splitNamespacedIdentifier(value);

  if (parts) {
    const namespace = normalizeIdentifierPartByVersion(parts.namespace, version, false);
    const path = normalizeIdentifierPartByVersion(parts.path, version, true);

    return parseStringToMinecraftIdentifier(`${namespace}:${path}`);
  }

  const path = normalizeIdentifierPartByVersion(value, version, true);

  return parseStringToMinecraftIdentifier(`${defaultNamespace}:${path}`);
};
