'use client'

import { useSyncExternalStore } from 'react'

export interface SaveData {
  sound: boolean
  records: Record<string, number>
  plays: Record<string, number>
  wins: Record<string, number>
  introSeen: Record<string, boolean>
  lastPlayed: string | null
}

const STORAGE_KEY = 'mini-games-hub:v1'

const DEFAULT_SAVE: SaveData = {
  sound: true,
  records: {},
  plays: {},
  wins: {},
  introSeen: {},
  lastPlayed: null,
}

let cache: SaveData | null = null
const listeners = new Set<() => void>()

function readFromStorage(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SAVE
    const parsed = JSON.parse(raw) as Partial<SaveData>
    return { ...DEFAULT_SAVE, ...parsed }
  } catch {
    return DEFAULT_SAVE
  }
}

export function getSave(): SaveData {
  if (typeof window === 'undefined') return DEFAULT_SAVE
  if (!cache) cache = readFromStorage()
  return cache
}

function updateSave(fn: (data: SaveData) => SaveData) {
  cache = fn(getSave())
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {}
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    cache = readFromStorage()
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useSave() {
  return useSyncExternalStore(subscribe, getSave, () => DEFAULT_SAVE)
}

export function setSound(enabled: boolean) {
  updateSave((data) => ({ ...data, sound: enabled }))
}

export function markIntroSeen(slug: string) {
  updateSave((data) => ({ ...data, introSeen: { ...data.introSeen, [slug]: true } }))
}

export function recordMatch(slug: string, score: number, won: boolean) {
  const previous = getSave().records[slug] ?? 0
  const best = Math.max(previous, Math.floor(score))
  updateSave((data) => ({
    ...data,
    lastPlayed: slug,
    records: { ...data.records, [slug]: best },
    plays: { ...data.plays, [slug]: (data.plays[slug] ?? 0) + 1 },
    wins: { ...data.wins, [slug]: (data.wins[slug] ?? 0) + (won ? 1 : 0) },
  }))
  return { best, isRecord: score > previous && score > 0 }
}

export function resetProgress() {
  updateSave((data) => ({ ...DEFAULT_SAVE, sound: data.sound }))
}
