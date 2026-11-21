import { beforeEach, describe, expect, it } from 'vitest'
import { localClient, resetLocalDb, setLocalSeed } from './localStore'

describe('localStore', () => {
  beforeEach(() => {
    setLocalSeed(() => ({ Venue: [{ id: 'v1', name: 'Library' }] }))
    resetLocalDb()
  })

  it('seeds on first use', async () => {
    const { data } = await localClient.models.Venue.list()
    expect(data.map(v => v.name)).toEqual(['Library'])
  })

  it('creates, reads, updates and deletes records', async () => {
    const { data: created } = await localClient.models.Goal.create({ userId: 'u1', title: 'Read more' })
    expect(created?.id).toBeTruthy()

    const { data: updated } = await localClient.models.Goal.update({ id: created!.id as string, title: 'Read daily' })
    expect(updated?.title).toBe('Read daily')

    const { data: fetched } = await localClient.models.Goal.get({ id: created!.id as string })
    expect(fetched?.title).toBe('Read daily')

    await localClient.models.Goal.delete({ id: created!.id as string })
    const { data: gone } = await localClient.models.Goal.get({ id: created!.id as string })
    expect(gone).toBeNull()
  })

  it('filters with eq, ne and contains', async () => {
    await localClient.models.Event.create({ id: 'e1', hostId: 'a', attendees: ['x'] })
    await localClient.models.Event.create({ id: 'e2', hostId: 'b', attendees: ['y'] })
    const byHost = await localClient.models.Event.list({ filter: { hostId: { eq: 'a' } } })
    const notHost = await localClient.models.Event.list({ filter: { hostId: { ne: 'a' } } })
    const attending = await localClient.models.Event.list({ filter: { attendees: { contains: 'y' } } })
    expect(byHost.data.map(e => e.id)).toEqual(['e1'])
    expect(notHost.data.map(e => e.id)).toEqual(['e2'])
    expect(attending.data.map(e => e.id)).toEqual(['e2'])
  })

  it('clears a field when updated to null', async () => {
    await localClient.models.Session.create({ id: 's1', cancellationReason: 'sick' })
    const { data } = await localClient.models.Session.update({ id: 's1', cancellationReason: null })
    expect(data).not.toHaveProperty('cancellationReason')
  })

  it('rejects duplicate ids', async () => {
    await localClient.models.User.create({ id: 'same' })
    const { errors } = await localClient.models.User.create({ id: 'same' })
    expect(errors?.[0].message).toMatch(/already exists/)
  })

  it('returns copies, so callers cannot mutate stored data by accident', async () => {
    const { data } = await localClient.models.Venue.get({ id: 'v1' })
    data!.name = 'changed'
    const { data: again } = await localClient.models.Venue.get({ id: 'v1' })
    expect(again?.name).toBe('Library')
  })
})
