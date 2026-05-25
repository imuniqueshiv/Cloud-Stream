import { Settings as SettingsIcon, Monitor, PlayCircle, Shield, Bell } from 'lucide-react';

// Mock settings categories for the UI layout
const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'appearance', label: 'Appearance', icon: Monitor },
  { id: 'playback', label: 'Playback', icon: PlayCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function Settings() {
  return (
    <div className="flex h-full flex-col bg-brand-dark p-6 md:p-10">
      
      {/* Header */}
      <header className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-brand-light md:text-4xl">
          Settings
        </h1>
      </header>

      {/* Settings Layout: Two Columns */}
      <div className="flex flex-1 gap-10">
        
        {/* Left Column: Navigation Tabs */}
        <nav className="w-64 shrink-0">
          <ul className="flex flex-col gap-1">
            {SETTINGS_TABS.map((tab, index) => (
              <li key={tab.id}>
                <button 
                  className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors ${
                    index === 0 
                      ? 'bg-brand-red/10 text-brand-red' 
                      : 'text-brand-gray hover:bg-white/5 hover:text-brand-light'
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Column: Settings Content Area */}
        <div className="flex-1 rounded-xl border border-white/5 bg-brand-black/40 p-8">
          
          <h2 className="mb-6 text-xl font-bold text-brand-light">
            General Settings
          </h2>

          <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
            <SettingsIcon size={48} className="mb-4 animate-[spin_4s_linear_infinite] text-brand-gray/50" />
            <h3 className="text-lg font-medium text-brand-light">
              Configuration Module Pending
            </h3>
            <p className="mt-2 text-sm text-brand-gray">
              Settings options will be populated in a future update.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}