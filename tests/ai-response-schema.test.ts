import { describe, expect, it } from 'vitest'
import { vocabularyAiResultSchema } from '../src/contracts'

const validResult = {
  word: 'negotiate',
  normalizedWord: 'negotiate',
  isPhrase: false,
  partOfSpeech: 'verb',
  cefrLevel: 'B2',
  englishDefinition: 'To discuss something to reach an agreement.',
  vietnameseMeaning: 'đàm phán',
  simpleExplanation: 'Talk and agree on terms.',
  pronunciation: 'nih-GOH-shee-ayt',
  ipa: '/nəˈɡoʊʃieɪt/',
  synonyms: ['bargain'],
  antonyms: ['refuse'],
  examples: ['We need to negotiate the price.'],
  collocations: ['negotiate a deal'],
  usageNotes: 'Common in business contexts.',
  commonMistakes: [],
  wordFamily: ['negotiation'],
  tags: ['business'],
}

describe('vocabularyAiResultSchema', () => {
  it('accepts a complete structured vocabulary result', () => {
    expect(vocabularyAiResultSchema.safeParse(validResult).success).toBe(true)
  })

  it('rejects incomplete AI output', () => {
    expect(vocabularyAiResultSchema.safeParse({ word: 'negotiate' }).success).toBe(false)
  })
})
