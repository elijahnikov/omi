import type { createOpenAI } from "@ai-sdk/openai";
import type { CoreMessage } from "ai";
import { ResourceEnricher } from "./base";

export interface SyncedEnricherInput {
  markdownContent?: string;
  providerId: string;
  subtitle?: string;
  title: string;
}

const MAX_CONTENT_LENGTH = 12_000;

export class SyncedEnricher extends ResourceEnricher {
  private readonly input: SyncedEnricherInput;

  constructor(
    provider: ReturnType<typeof createOpenAI>,
    input: SyncedEnricherInput
  ) {
    super(provider);
    this.input = input;
  }

  protected buildMessages(): CoreMessage[] {
    const content =
      this.input.markdownContent?.slice(0, MAX_CONTENT_LENGTH) ??
      this.input.subtitle ??
      this.input.title;

    return [
      {
        role: "user",
        content: `You are an expert content analyst for a personal knowledge management system.

Analyze the following synced item from ${this.input.providerId} and extract structured metadata. Be concise and accurate.

Title: ${this.input.title}
${this.input.subtitle ? `Context: ${this.input.subtitle}\n` : ""}
Content:
${content}`,
      },
    ];
  }
}
