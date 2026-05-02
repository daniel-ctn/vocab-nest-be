import { describe, expect, it } from 'vitest'
import { dedupeGroupIds } from '../src/modules/vocabulary/vocabulary-groups'

describe('dedupeGroupIds', () => {
  it('keeps group replacement payloads unique in original order', () => {
    expect(dedupeGroupIds(['g1', 'g2', 'g1', 'g3'])).toEqual(['g1', 'g2', 'g3'])
  })
})
