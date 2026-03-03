type ReportsStubPageProps = {
  onNavigate: (route: string) => void;
};

export function ReportsStubPage({ onNavigate }: ReportsStubPageProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-card">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 6L6 18V30L24 42L42 30V18L24 6Z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 18L24 30L42 18" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 30V42" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="empty-state-title">Reports</h1>
        <p className="empty-state-description">
          View analytics, insights, and performance metrics. Reports are coming soon.
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

