import {
  BedrockBody,
  BedrockRecipe,
  BedrockTag,
  BedrockWrapperKey,
  BedrockFormatVersion,
} from "../recipes/types";

export interface BedrockWrapperOptions {
  identifier: string;
  priority: number;
  formatVersion: BedrockFormatVersion;
}

export const wrapBedrockRecipe = (
  inner: BedrockBody,
  wrapperKey: BedrockWrapperKey,
  tags: BedrockTag[],
  options: BedrockWrapperOptions,
): BedrockRecipe => {
  const payload = {
    description: {
      identifier: options.identifier,
    },
    tags,
    ...(options.priority !== 0 ? { priority: options.priority } : {}),
    ...inner,
  };

  return {
    format_version: options.formatVersion,
    [wrapperKey]: payload,
  } as unknown as BedrockRecipe;
};
