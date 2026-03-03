import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function RRInactivityBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Handle banner dismissal (session-only, no persistence)
  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <div className="rr-inactivity-banner">
      <div className="rr-inactivity-banner-content">
        <div className="rr-inactivity-banner-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.032 0-5.5-2.468-5.5-5.5S4.968 2.5 8 2.5 13.5 4.968 13.5 8 11.032 13.5 8 13.5z"
              fill="currentColor"
            />
            <path
              d="M8 4.5c-.414 0-.75.336-.75.75v3c0 .414.336.75.75.75s.75-.336.75-.75v-3c0-.414-.336-.75-.75-.75zM8 11c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="rr-inactivity-banner-text">
          <span>No new repair requests have been logged in the last 30 days.</span>
        </div>
        <button
          type="button"
          className="rr-inactivity-banner-close"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="rr-inactivity-banner-close-icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

