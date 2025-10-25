import { getPayload, Payload } from 'deesse'
import config from '@/deesse.config'

import { describe, it, beforeAll, expect } from 'vitest'

let deesse: Payload

describe('API', () => {
  beforeAll(async () => {
    const deesseConfig = await config
    deesse = await getPayload({ config: deesseConfig })
  })

  it('fetches users', async () => {
    const users = await deesse.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
