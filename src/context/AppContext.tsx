import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppSettings } from '@/types'

interface AppContextType {
  settings: AppSettings
  loading: boolean
  updateSettings: (_settings: Partial<AppSettings>) => Promise<void>
}

const defaultSettings: AppSettings = {
  businessName: 'Parlour Manager',
  ownerName: 'Owner',
  currency: '₹',
}

const AppContext = createContext<AppContextType>({
  settings: defaultSettings,
  loading: true,
  updateSettings: async () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data } = await supabase.from('settings').select('key, value')
      if (data) {
        const s = { ...defaultSettings }
        for (const row of data) {
          if (row.key === 'business_name') s.businessName = row.value
          if (row.key === 'owner_name') s.ownerName = row.value
          if (row.key === 'currency') s.currency = row.value
        }
        setSettings(s)
      }
    } catch {
      console.warn('Failed to load settings, using defaults')
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings(updated: Partial<AppSettings>) {
    const entries = Object.entries(updated)
    for (const [key, value] of entries) {
      const dbKey =
        key === 'businessName' ? 'business_name' : key === 'ownerName' ? 'owner_name' : key
      await supabase.from('settings').upsert(
        { key: dbKey, value: String(value) },
        { onConflict: 'key' },
      )
    }
    setSettings((prev) => ({ ...prev, ...updated }))
  }

  return (
    <AppContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
