import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useApp } from '@/context/AppContext'

export function Settings() {
  const { settings, updateSettings } = useApp()
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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
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
    </div>
  )
}
