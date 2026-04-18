import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Server, Save, Loader2 } from "lucide-react";

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  apiUrl: string;
  notifications: {
    priceAlerts: boolean;
    aiPredictions: boolean;
    portfolio: boolean;
    marketNews: boolean;
  };
}

const defaultSettings: UserSettings = {
  firstName: '',
  lastName: '',
  email: '',
  apiUrl: 'http://localhost:3000',
  notifications: {
    priceAlerts: true,
    aiPredictions: true,
    portfolio: true,
    marketNews: false,
  }
};

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  // Check backend connectivity
  useEffect(() => {
    fetch(`${settings.apiUrl}/health`)
      .then(res => {
        if (res.ok) setBackendStatus('online');
        else setBackendStatus('offline');
      })
      .catch(() => setBackendStatus('offline'));
  }, [settings.apiUrl]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    
    // Save to localStorage (in production, this would call an API)
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Backend Status */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">Backend API</div>
                <div className="text-xs text-muted-foreground">{settings.apiUrl}</div>
              </div>
            </div>
            {backendStatus === 'online' ? (
              <div className="flex items-center gap-2 text-bullish">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs">Online</span>
              </div>
            ) : backendStatus === 'offline' ? (
              <div className="flex items-center gap-2 text-bearish">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Offline</span>
              </div>
            ) : (
              <div className="h-4 w-4 animate-pulse bg-primary rounded-full" />
            )}
          </div>
        </div>

        {/* Profile */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Profile</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">First Name</label>
                <Input 
                  value={settings.firstName} 
                  onChange={(e) => updateSetting('firstName', e.target.value)}
                  className="bg-muted border-border" 
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Last Name</label>
                <Input 
                  value={settings.lastName} 
                  onChange={(e) => updateSetting('lastName', e.target.value)}
                  className="bg-muted border-border" 
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input 
                value={settings.email} 
                onChange={(e) => updateSetting('email', e.target.value)}
                className="bg-muted border-border" 
                placeholder="trader@example.com"
              />
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Backend API URL</label>
              <Input 
                value={settings.apiUrl} 
                onChange={(e) => updateSetting('apiUrl', e.target.value)}
                className="bg-muted border-border" 
                placeholder="http://localhost:3000"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded">
              <span className="text-sm text-foreground">Price alerts</span>
              <input 
                type="checkbox" 
                checked={settings.notifications.priceAlerts}
                onChange={(e) => updateSetting('notifications', { ...settings.notifications, priceAlerts: e.target.checked })}
                className="w-4 h-4 accent-primary" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded">
              <span className="text-sm text-foreground">AI prediction updates</span>
              <input 
                type="checkbox" 
                checked={settings.notifications.aiPredictions}
                onChange={(e) => updateSetting('notifications', { ...settings.notifications, aiPredictions: e.target.checked })}
                className="w-4 h-4 accent-primary" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded">
              <span className="text-sm text-foreground">Portfolio changes</span>
              <input 
                type="checkbox" 
                checked={settings.notifications.portfolio}
                onChange={(e) => updateSetting('notifications', { ...settings.notifications, portfolio: e.target.checked })}
                className="w-4 h-4 accent-primary" 
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted/50 rounded">
              <span className="text-sm text-foreground">Market news</span>
              <input 
                type="checkbox" 
                checked={settings.notifications.marketNews}
                onChange={(e) => updateSetting('notifications', { ...settings.notifications, marketNews: e.target.checked })}
                className="w-4 h-4 accent-primary" 
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {saved && (
            <span className="text-bullish text-sm flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Settings saved!
            </span>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
