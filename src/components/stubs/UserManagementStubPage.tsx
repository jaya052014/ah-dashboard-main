type UserManagementStubPageProps = {
  onNavigate: (route: string) => void;
};

export function UserManagementStubPage({ onNavigate }: UserManagementStubPageProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-card">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="16" r="8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 40C8 32 15.5817 26 24 26C32.4183 26 40 32 40 40" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="36" cy="12" r="4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M44 20C44 17.7909 42.2091 16 40 16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="empty-state-title">User Management</h1>
        <p className="empty-state-description">
          Manage access for plant teams, buyers, and admins. User management is coming soon.
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

