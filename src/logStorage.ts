import type { TrustId } from './config/types'
import type { DisplayLogEntry } from './types'

export interface SavedLogMeta {
  torAt?: string
  vodAt?: string
  elapsed?: string
  initialRhythm?: string
}

export interface SavedLogRecord {
  id: string
  trustId: TrustId
  documentTitle: string
  savedAt: number
  entries: DisplayLogEntry[]
  meta: SavedLogMeta
  isAutosave?: boolean
}

export const AUTOSAVE_LOG_ID = '__autosave__'

const DB_NAME = 'resusci-time'
const DB_VERSION = 1
const STORE = 'saved-logs'
const FALLBACK_STORAGE_KEY = 'resusci-time-saved-logs-v1'

type StorageBackend = 'indexeddb' | 'localstorage'

let preferredBackend: StorageBackend | null = null

function generateLogId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
  })
}

function runIndexedDbTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const store = tx.objectStore(STORE)
        let result: T

        try {
          const request = run(store)
          request.onsuccess = () => {
            result = request.result as T
          }
          request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
        } catch (error) {
          reject(error)
          return
        }

        tx.oncomplete = () => {
          db.close()
          resolve(result)
        }
        tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
        tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
      }),
  )
}

function readFallbackRecords(): SavedLogRecord[] {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedLogRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeFallbackRecords(records: SavedLogRecord[]): void {
  localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(records))
}

function useBackend(): StorageBackend {
  if (preferredBackend) return preferredBackend
  if (typeof indexedDB !== 'undefined') {
    preferredBackend = 'indexeddb'
  } else if (typeof localStorage !== 'undefined') {
    preferredBackend = 'localstorage'
  } else {
    preferredBackend = 'localstorage'
  }
  return preferredBackend
}

function markBackendUnavailable(backend: StorageBackend): void {
  if (preferredBackend === backend) {
    preferredBackend = backend === 'indexeddb' ? 'localstorage' : null
  }
}

async function readAllRecords(): Promise<SavedLogRecord[]> {
  if (useBackend() === 'indexeddb') {
    try {
      return await runIndexedDbTransaction('readonly', (store) => store.getAll())
    } catch {
      markBackendUnavailable('indexeddb')
    }
  }

  return readFallbackRecords()
}

async function writeRecord(record: SavedLogRecord): Promise<void> {
  if (useBackend() === 'indexeddb') {
    try {
      await runIndexedDbTransaction('readwrite', (store) => store.put(record))
      return
    } catch {
      markBackendUnavailable('indexeddb')
    }
  }

  const records = readFallbackRecords()
  const index = records.findIndex((item) => item.id === record.id)
  if (index >= 0) records[index] = record
  else records.push(record)
  writeFallbackRecords(records)
}

async function removeRecord(id: string): Promise<void> {
  if (useBackend() === 'indexeddb') {
    try {
      await runIndexedDbTransaction('readwrite', (store) => store.delete(id))
      return
    } catch {
      markBackendUnavailable('indexeddb')
    }
  }

  writeFallbackRecords(readFallbackRecords().filter((record) => record.id !== id))
}

export function isLogStorageAvailable(): boolean {
  return typeof indexedDB !== 'undefined' || typeof localStorage !== 'undefined'
}

export function formatSavedLogLabel(savedAt: number): string {
  return new Date(savedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export async function listSavedLogs(): Promise<SavedLogRecord[]> {
  if (!isLogStorageAvailable()) return []
  const records = await readAllRecords()
  return records
    .filter((record) => record.id !== AUTOSAVE_LOG_ID)
    .sort((a, b) => b.savedAt - a.savedAt)
}

export async function saveLogToDevice(input: {
  trustId: TrustId
  documentTitle: string
  entries: readonly DisplayLogEntry[]
  meta?: SavedLogMeta
}): Promise<SavedLogRecord> {
  if (!isLogStorageAvailable()) {
    throw new Error('This browser does not support on-device log storage.')
  }

  const record: SavedLogRecord = {
    id: generateLogId(),
    trustId: input.trustId,
    documentTitle: input.documentTitle,
    savedAt: Date.now(),
    entries: input.entries.map((entry) => ({ ...entry })),
    meta: input.meta ?? {},
  }

  await writeRecord(record)
  return record
}

export async function deleteSavedLog(id: string): Promise<void> {
  if (!isLogStorageAvailable()) return
  await removeRecord(id)
}

export async function getSavedLog(id: string): Promise<SavedLogRecord | null> {
  if (!isLogStorageAvailable()) return null
  const records = await readAllRecords()
  return records.find((record) => record.id === id) ?? null
}

export async function getAutosaveLog(): Promise<SavedLogRecord | null> {
  return getSavedLog(AUTOSAVE_LOG_ID)
}

export async function autosaveLog(input: {
  trustId: TrustId
  documentTitle: string
  entries: readonly DisplayLogEntry[]
  meta?: SavedLogMeta
}): Promise<void> {
  if (!isLogStorageAvailable() || input.entries.length === 0) return

  const record: SavedLogRecord = {
    id: AUTOSAVE_LOG_ID,
    trustId: input.trustId,
    documentTitle: input.documentTitle,
    savedAt: Date.now(),
    entries: input.entries.map((entry) => ({ ...entry })),
    meta: input.meta ?? {},
    isAutosave: true,
  }

  await writeRecord(record)
}

export async function clearAutosaveLog(): Promise<void> {
  await deleteSavedLog(AUTOSAVE_LOG_ID)
}
