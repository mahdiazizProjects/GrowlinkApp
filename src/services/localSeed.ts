// Registers the first-run dataset for local mode. Imported for its side effect by api.ts.
import { setLocalSeed } from './localStore'
import { DEMO_MENTORS, DEMO_VENUES, buildDemoEvents } from '../data/demoData'

setLocalSeed(() => {
  const now = new Date().toISOString()
  const stamp = (rows: Record<string, unknown>[]) => rows.map(r => ({ createdAt: now, updatedAt: now, ...r }))
  return {
    User: stamp(DEMO_MENTORS),
    Venue: stamp(DEMO_VENUES),
    Event: stamp(buildDemoEvents())
  }
})
