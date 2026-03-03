type RequestsStubPageProps = {
  onNavigate: (route: string) => void;
};

export function RequestsStubPage({ onNavigate }: RequestsStubPageProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-card">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="8" width="36" height="32" rx="2" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 16L24 24L42 16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 32H42" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="empty-state-title">Requests</h1>
        <p className="empty-state-description">
          Track requests related to repairs, approvals, and changes. This area is coming soon.
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

