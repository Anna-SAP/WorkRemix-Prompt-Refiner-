import { AttachedImage } from "../types";

export class GeminiService {
  /**
   * Refines the prompt using Gemini 4 Argon via server-side streaming endpoint
   */
  async refinePromptStream(
    inputText: string,
    images: AttachedImage[],
    onChunk: (text: string) => void
  ): Promise<void> {
    const response = await fetch("/api/refine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputText, images }),
    });

    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const errData = await response.json();
        if (errData?.error) errMsg = errData.error;
      } catch {
        // Ignore JSON parse error
      }
      throw new Error(errMsg);
    }

    if (!response.body) {
      throw new Error("Response body is empty");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;

        const parsed = JSON.parse(payload);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.text) {
          onChunk(parsed.text);
        }
      }
    }
  }
}

export const geminiService = new GeminiService();