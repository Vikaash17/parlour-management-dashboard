import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'
import { useDarkMode } from '@/hooks/useDarkMode'

export function Settings() {
  const { settings, updateSettings } = useApp()
  const { isDark, toggle } = useDarkMode()
  const [businessName, setBusinessName] = useState(settings.businessName)
  const [ownerName, setOwnerName] = useState(settings.ownerName)
  const [currency, setCurrency] = useState(settings.currency)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    try {
      setSaving(true)
      await updateSettings({ businessName, ownerName, currency })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your parlour name"
          />
          <Input
            label="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="₹"
            maxLength={5}
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={saving}>
              Save Settings
            </Button>
            {saved && <span className="text-sm text-green-600">Saved successfully!</span>}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <button
          onClick={toggle}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-gray-600" />}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isDark ? 'bg-pink-500' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : ''}`} />
          </div>
        </button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your data is stored in Supabase cloud database. It is automatically backed up.
          </p>
          <p className="text-sm text-gray-500">
            To export a full backup, go to your Supabase dashboard and use the database backup feature.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>App Name:</strong> Parlour Manager</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Built with:</strong> React, TypeScript, Supabase, Tailwind CSS</p>
        </div>
      </Card>
    </div>
  )
}
