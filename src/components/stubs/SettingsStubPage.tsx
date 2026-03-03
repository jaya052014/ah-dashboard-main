type SettingsStubPageProps = {
  onNavigate: (route: string) => void;
};

export function SettingsStubPage({ onNavigate }: SettingsStubPageProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-card">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 6V10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 38V42" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 24H38" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 24H6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M35.314 12.686L32.485 15.515" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.515 32.485L12.686 35.314" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M35.314 35.314L32.485 32.485" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.515 15.515L12.686 12.686" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="empty-state-title">Settings</h1>
        <p className="empty-state-description">
          Adjust preferences, defaults, and integrations for your analytics workspace. Settings will be available here soon.
        </p>
        <button
          type="button"
          className="empty-state-button"
          onClick={() => onNavigate("/dashboard")}
        >
          Main Page
        </button>
      </div>
    </div>
  );
}

