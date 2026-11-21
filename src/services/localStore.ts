// A tiny localStorage-backed stand-in for the Amplify Data client, used in local mode.
// It implements the subset of the model API that `api.ts` relies on:
//   models.<Model>.get / create / update / delete / list({ filter })
// Filters support `{ field: { eq | ne | contains } }` on any number of fields (AND-ed).

type Rec = Record<string, unknown>
type Db = Record<string, Rec[]>

const STORAGE_KEY = 'growlink.local.db.v1'

let memory: Db | null = null

function readStorage(): Db | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Db) : null
  } catch {
    return null
  }
}

function writeStorage(db: Db): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage unavailable or full: keep working from memory for this tab.
  }
}

let seeder: (() => Db) | null = null

/** Registers the function that builds the first-run demo dataset. */
export function setLocalSeed(fn: () => Db): void {
  seeder = fn
}

function db(): Db {
  if (memory) return memory
  const stored = readStorage()
  if (stored) {
    memory = stored
  } else {
    memory = seeder ? seeder() : {}
    writeStorage(memory)
  }
  return memory
}

function commit(): void {
  if (memory) writeStorage(memory)
}

export function newId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

type Condition = { eq?: unknown; ne?: unknown; contains?: unknown }
export type Filter = Record<string, Condition>

function matches(rec: Rec, filter?: Filter): boolean {
  if (!filter) return true
  return Object.entries(filter).every(([field, cond]) => {
    const value = rec[field]
    if (cond.eq !== undefined && value !== cond.eq) return false
    if (cond.ne !== undefined && value === cond.ne) return false
    if (cond.contains !== undefined) {
      if (Array.isArray(value)) return value.includes(cond.contains)
      if (typeof value === 'string') return value.includes(String(cond.contains))
      return false
    }
    return true
  })
}

function table(name: string): Rec[] {
  const d = db()
  if (!d[name]) d[name] = []
  return d[name]
}

function clone<T>(v: T): T {
  return v == null ? v : (JSON.parse(JSON.stringify(v)) as T)
}

function model(name: string) {
  return {
    async get({ id }: { id: string }) {
      const rec = table(name).find(r => r.id === id)
      return { data: clone(rec) ?? null, errors: undefined }
    },
    async create(input: Rec) {
      const rows = table(name)
      const id = (input.id as string) || newId()
      if (rows.some(r => r.id === id)) {
        return { data: null, errors: [{ message: `${name} with id ${id} already exists` }] }
      }
      const now = new Date().toISOString()
      const rec: Rec = { createdAt: now, updatedAt: now }
      for (const [k, v] of Object.entries(input)) if (v !== undefined) rec[k] = v
      rec.id = id
      rows.push(rec)
      commit()
      return { data: clone(rec), errors: undefined }
    },
    async update(input: Rec & { id: string }) {
      const rec = table(name).find(r => r.id === input.id)
      if (!rec) return { data: null, errors: [{ message: `${name} ${input.id} not found` }] }
      for (const [k, v] of Object.entries(input)) {
        if (k === 'id' || v === undefined) continue
        if (v === null) delete rec[k]
        else rec[k] = v
      }
      rec.updatedAt = new Date().toISOString()
      commit()
      return { data: clone(rec), errors: undefined }
    },
    async delete({ id }: { id: string }) {
      const rows = table(name)
      const idx = rows.findIndex(r => r.id === id)
      if (idx === -1) return { data: null, errors: [{ message: `${name} ${id} not found` }] }
      const [removed] = rows.splice(idx, 1)
      commit()
      return { data: clone(removed), errors: undefined }
    },
    async list(options?: { filter?: Filter; limit?: number; nextToken?: string | null }) {
      const rows = table(name).filter(r => matches(r, options?.filter))
      return { data: clone(rows), nextToken: null as string | null, errors: undefined }
    }
  }
}

export type LocalModel = ReturnType<typeof model>

const cache: Record<string, LocalModel> = {}

export const localClient = {
  models: new Proxy({} as Record<string, LocalModel>, {
    get(_target, prop) {
      const name = String(prop)
      if (!cache[name]) cache[name] = model(name)
      return cache[name]
    }
  })
}

/** Wipes the local database (and re-seeds on next access). Used by tests and the "reset demo data" action. */
export function resetLocalDb(): void {
  memory = null
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
