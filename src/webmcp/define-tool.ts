import { z } from "zod";

import { isValidToolName } from "./model-context";

import type {
  JsonSchemaObject,
  ModelContextExecuteOptions,
  ModelContextTool,
  ModelContextToolAnnotations,
} from "./types";

export type ToolExecuteContext = { signal: AbortSignal };

export type ToolCallEvent = { toolName: string; success: boolean };
export type ToolCallListener = (event: ToolCallEvent) => void;

export interface ToolDefinition<TSchema extends z.ZodType> {
  name: string;
  title?: string;
  description: string;
  /** zod object schema describing the tool input. */
  input: TSchema;
  annotations?: ModelContextToolAnnotations;
  /** May return a value or a promise; the resolved value is stringified for the agent. */
  execute: (input: z.output<TSchema>, context: ToolExecuteContext) => unknown;
}

let toolCallListener: ToolCallListener | undefined;

/**
 * Installs a hook that is called after every tool execution (e.g. for
 * analytics). Kept injectable so this module stays free of app imports.
 */
export const setToolCallListener = (listener: ToolCallListener | undefined): void => {
  toolCallListener = listener;
};

const formatIssues = (issues: z.core.$ZodIssue[]): string =>
  issues
    .map((issue) => {
      const path = issue.path.length === 0 ? "(input)" : issue.path.map(String).join(".");
      return `${path}: ${issue.message}`;
    })
    .join("; ");

const toError = (thrown: unknown): Error =>
  thrown instanceof Error ? thrown : new Error(String(thrown));

const toInputSchema = (schema: z.ZodType): JsonSchemaObject => {
  // `io: "input"` makes fields with defaults optional, which is what callers see.
  const jsonSchema: JsonSchemaObject = { ...z.toJSONSchema(schema, { io: "input" }) };
  delete jsonSchema.$schema;
  return jsonSchema;
};

export const defineTool = <TSchema extends z.ZodType>(
  definition: ToolDefinition<TSchema>,
): ModelContextTool => {
  const { name, title, description, annotations } = definition;

  if (!isValidToolName(name)) {
    throw new Error(`Invalid WebMCP tool name "${name}": must match /^[a-zA-Z0-9_.-]{1,128}$/`);
  }

  if (description.trim().length === 0) {
    throw new Error(`WebMCP tool "${name}" must have a non-empty description`);
  }

  const notify = (success: boolean) => toolCallListener?.({ toolName: name, success });

  const execute = async (
    rawInput: unknown,
    options?: ModelContextExecuteOptions,
  ): Promise<unknown> => {
    const parsed = definition.input.safeParse(rawInput ?? {});
    if (!parsed.success) {
      notify(false);
      throw new Error(`Invalid input for ${name}: ${formatIssues(parsed.error.issues)}`);
    }

    try {
      const result = await definition.execute(parsed.data, {
        signal: options?.signal ?? new AbortController().signal,
      });
      notify(true);
      return result;
    } catch (thrown) {
      notify(false);
      throw toError(thrown);
    }
  };

  return {
    name,
    ...(title ? { title } : {}),
    description,
    inputSchema: toInputSchema(definition.input),
    ...(annotations ? { annotations } : {}),
    execute,
  };
};
