import OpenAI from "openai";
import { z } from "zod";
import { vocabularyAiResultSchema, type VocabularyAiResult } from "@vocabnest/contracts";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors";
import { normalizeVocabularyQuery } from "./vocabulary-normalize";
import { vocabularyAiSystemPrompt, vocabularyAiUserPrompt } from "./vocabulary-ai.prompt";

const mockByWord: Record<string, Partial<VocabularyAiResult>> = {
  negotiate: {
    partOfSpeech: "verb",
    cefrLevel: "B2",
    englishDefinition: "To discuss something in order to reach an agreement.",
    vietnameseMeaning: "đàm phán, thương lượng",
    simpleExplanation: "You negotiate when you talk with someone to agree on terms.",
    pronunciation: "nih-GOH-shee-ayt",
    ipa: "/nəˈɡoʊʃieɪt/",
    synonyms: ["bargain", "discuss", "arrange"],
    antonyms: ["refuse", "reject"],
    examples: [
      "The manager will negotiate the contract tomorrow.",
      "We negotiated a better price for the apartment.",
    ],
    collocations: ["negotiate a contract", "negotiate a deal"],
    usageNotes: "Often used in business, politics, and everyday agreements.",
    commonMistakes: ["Do not say 'negotiate about a price' when 'negotiate a price' is enough."],
    wordFamily: ["negotiation", "negotiator", "negotiable"],
    tags: ["business", "communication"],
  },
};

const buildMockResult = (query: string): VocabularyAiResult => {
  const normalizedWord = normalizeVocabularyQuery(query);
  const base = mockByWord[normalizedWord] ?? {};

  return vocabularyAiResultSchema.parse({
    word: query.trim(),
    normalizedWord,
    isPhrase: normalizedWord.includes(" "),
    partOfSpeech: base.partOfSpeech ?? "word",
    cefrLevel: base.cefrLevel ?? "B1",
    englishDefinition:
      base.englishDefinition ?? `A useful English vocabulary item for "${query.trim()}".`,
    vietnameseMeaning: base.vietnameseMeaning ?? `Nghĩa tiếng Việt của "${query.trim()}".`,
    simpleExplanation:
      base.simpleExplanation ??
      `Use "${query.trim()}" when you want to express this idea in English.`,
    pronunciation: base.pronunciation ?? query.trim(),
    ipa: base.ipa ?? "/mock/",
    synonyms: base.synonyms ?? [],
    antonyms: base.antonyms ?? [],
    examples: base.examples ?? [`I want to learn how to use "${query.trim()}" correctly.`],
    collocations: base.collocations ?? [],
    usageNotes: base.usageNotes ?? "Demo response generated without an AI API key.",
    commonMistakes: base.commonMistakes ?? [],
    wordFamily: base.wordFamily ?? [],
    tags: base.tags ?? ["demo"],
  });
};

export const generateVocabularyDetails = async (
  query: string,
): Promise<{ result: VocabularyAiResult; demoMode: boolean }> => {
  if (!env.OPENAI_API_KEY) {
    return { result: buildMockResult(query), demoMode: true };
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const schema = z.toJSONSchema(vocabularyAiResultSchema, {
    target: "openapi-3.0",
    unrepresentable: "any",
  });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: vocabularyAiSystemPrompt },
      { role: "user", content: vocabularyAiUserPrompt(query) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "vocabulary_result",
        strict: true,
        schema,
      },
    },
  });

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new AppError(502, "AI_EMPTY_RESPONSE", "AI provider returned an empty response.");
  }

  const parsedJson = JSON.parse(content) as unknown;
  const parsed = vocabularyAiResultSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new AppError(502, "AI_VALIDATION_ERROR", "AI response did not match the contract.", {
      issues: parsed.error.flatten(),
    });
  }

  return { result: parsed.data, demoMode: false };
};
