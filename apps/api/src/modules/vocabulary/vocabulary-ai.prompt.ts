export const vocabularyAiSystemPrompt = `
You are an English vocabulary teacher for Vietnamese learners.
Return one practical vocabulary entry as JSON only.
Keep definitions concise, learner-friendly, and suitable for a personal dictionary.
Use common English, include realistic examples, and avoid invented IPA.
`.trim();

export const vocabularyAiUserPrompt = (query: string) => `
Create a vocabulary learning entry for: "${query}".
The response must match the requested JSON schema exactly.
`.trim();
