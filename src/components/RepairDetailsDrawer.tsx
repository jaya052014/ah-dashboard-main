import { useEffect, useState } from "react";
import { XMarkIcon, ArrowDownTrayIcon, CheckCircleIcon, PencilIcon, CheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { AllRepairsRow, RepairStatus } from "./tables/AllRepairsTable";
import { REPAIR_STATUS_CONFIG } from "../constants/repairStatusConfig";
import { AttachmentViewer } from "./AttachmentViewer";
import { ApproveModal } from "./ApproveModal";
import { RejectModal } from "./RejectModal";

type RepairDetailsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  repair: AllRepairsRow | null;
  onRepairUpdate?: (rrNumber: string, updates: Partial<AllRepairsRow>) => void;
};

type StatusHistoryItem = {
  date: string;
  status: RepairStatus;
  note: string;
  timestamp?: Date;
};

// Status badge component with icon and refined styling
function StatusBadge({ status }: { status: RepairStatus }) {
  const config = REPAIR_STATUS_CONFIG[status];
  if (!config) return <span>{status}</span>;

  const IconComponent = config.IconComponent;

  return (
    <span
      className="status-pill"
      style={{
        backgroundColor: config.badgeBackground,
        color: config.badgeTextColor,
      }}
    >
      <span
        className="status-pill-icon-wrapper"
        style={{ color: config.badgeTextColor }}
      >
        <IconComponent className="status-pill-icon" />
      </span>
      <span className="status-pill-label">{config.label}</span>
    </span>
  );
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

// Generate complete status history with progression
// Only shows statuses that have been reached, plus the current one
// Only shows Rejected/Not Repairable if that's the actual current status
const getStatusHistory = (repair: AllRepairsRow | null): StatusHistoryItem[] => {
  if (!repair) return [];
  
  const history: StatusHistoryItem[] = [];
  const today = new Date();
  const currentStatus = repair.status;
  
  // Define the main progression path (excluding terminal states)
  const mainProgression: RepairStatus[] = [
    "Repair Logged",
    "Awaiting Quote",
    "PO",
    "Awaiting Approval",
    "In Progress",
    "Completed",
  ];
  
  // If current status is in main progression, show all up to current
  if (mainProgression.includes(currentStatus)) {
    const currentIndex = mainProgression.indexOf(currentStatus);
    for (let i = 0; i <= currentIndex; i++) {
      const status = mainProgression[i];
      const daysAgo = (currentIndex - i) * 3 + Math.floor(Math.random() * 2);
      const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      let note = "";
      switch (status) {
        case "Repair Logged":
          note = "Repair request logged";
          break;
        case "Awaiting Quote":
          note = "Part received and evaluation started";
          break;
        case "PO":
          note = "Purchase order created";
          break;
        case "Awaiting Approval":
          note = "Quote submitted for review";
          break;
        case "In Progress":
          note = "Repair work initiated";
          break;
        case "Completed":
          note = "Repair completed and tested";
          break;
      }
      
      history.unshift({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status,
        note,
        timestamp: date,
      });
    }
  } else if (currentStatus === "Rejected" || currentStatus === "Not Repairable" || currentStatus === "Repair Logged") {
    // For terminal states or Repair Logged, show progression up to "Awaiting Approval", then the terminal state
    const daysAgo = 5 + Math.floor(Math.random() * 2);
    const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Add Repair Logged if status is Repair Logged
    if (currentStatus === "Repair Logged") {
      history.unshift({
        date: new Date(today.getTime() - (daysAgo + 1) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Repair Logged",
        note: "Repair request logged",
        timestamp: new Date(today.getTime() - (daysAgo + 1) * 24 * 60 * 60 * 1000),
      });
    }
    
    // Add Awaiting Quote
    history.unshift({
      date: new Date(today.getTime() - (daysAgo + 3) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Awaiting Quote",
      note: "Part received and evaluation started",
      timestamp: new Date(today.getTime() - (daysAgo + 3) * 24 * 60 * 60 * 1000),
    });
    
    // Add Awaiting Approval
    history.unshift({
      date: new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Awaiting Approval",
      note: "Quote submitted for review",
      timestamp: new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000),
    });
    
    // Add the terminal state
    let note = "";
    if (currentStatus === "Rejected") {
      note = "Quote rejected";
    } else {
      note = "Component determined warranty recapture";
    }
    
    history.unshift({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: currentStatus,
      note,
      timestamp: date,
    });
  }
  
  return history;
};

// Demo attachments - fixed Unsplash images for Attachments gallery
// Photo IDs extracted from Unsplash URLs
const DEMO_ATTACHMENTS: string[] = [
  // Main image - gray metal panel with toggle levers
  "https://sbindustrialsupply.com/wp-content/uploads/imported/0/20/NEW-SPX-015-U1-POSITIVE-DISPLACEMENT-PUMP-2693124-R1-3-015U1-353676575920-2-300x300.jpg",
  // Thumbnail 1 - brown and gray metal part close-up
  "https://images-edcjb4a9fffkdsfk.z01.azurefd.net/prod-images/362089-1t.jpg",
  // Thumbnail 2 - large factory machinery
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6sHSgTTUGK_-mYjbZb_gDNkSMEjkLKpxKeA&s",
  // Thumbnail 3 - white and black industrial machine
  "https://images-edcjb4a9fffkdsfk.z01.azurefd.net/prod-images/362089-5t.jpg",
  // Thumbnail 4 - pipes connected to a building
  "https://images-edcjb4a9fffkdsfk.z01.azurefd.net/prod-images/362089-4t.jpg",
];

// Get attachments - returns real attachments if available, otherwise demo images
const getAttachments = (_repair: AllRepairsRow | null): string[] => {
  // TODO: Replace with real attachments from repair data when available
  // When real attachments are provided, use: _repair.attachments?.length > 0 ? _repair.attachments : DEMO_ATTACHMENTS
  
  // For now, always return demo images as fallback
  // This ensures the gallery always shows images until real attachments are wired
  return DEMO_ATTACHMENTS;
};


type CustomerReference = {
  id: number;
  name: string;
  value: string;
};

const INITIAL_CUSTOMER_REFERENCES: CustomerReference[] = [
  { id: 1, name: "SAP Master Material / MPN#", value: "140044272" },
  { id: 2, name: "Work Order#", value: "605432292" },
  { id: 3, name: "RMA#", value: "NA" },
  { id: 4, name: "Repair#", value: "NA" },
  { id: 5, name: "PON", value: "NA" },
  { id: 6, name: "LPP", value: "NA" },
];

type WorkScopeLineItem = {
  id: number;
  partNumber: string;
  serialNumber: string;
  description: string;
  qty: number;
  leadTime: string;
  total: number;
};

const INITIAL_WORK_SCOPE_ITEMS: WorkScopeLineItem[] = [
  {
    id: 1,
    partNumber: "AHR-U1015",
    serialNumber: "22238398",
    description: "Complete disassembly, cleaning, and inspection of all components",
    qty: 1,
    leadTime: "5-7 days",
    total: 1200,
  },
  {
    id: 2,
    partNumber: "BEAR-4456",
    serialNumber: "33445566",
    description: "Replacement of worn seals and bearings, recalibration of pressure sensors",
    qty: 1,
    leadTime: "3-5 days",
    total: 675,
  },
];

// Helper to get styling based on Days in Progress severity buckets
const getDaysInProgressColor = (days: number): { 
  iconColor: string; 
  iconBackgroundColor: string; // White for icon container
  cardBackground: string; // Light tinted background for card
  cardBorder: string; // Solid border color
  valueColor: string; // Text color for value
} => {
  if (days <= 30) {
    // Up to 1 month → BLUE
    return {
      iconColor: "#2563eb", // Blue-600
      iconBackgroundColor: "#ffffff", // White
      cardBackground: "#dbeafe", // Blue-100 (light tint)
      cardBorder: "#2563eb", // Blue-600 (solid border)
      valueColor: "#1e40af", // Blue-800 (readable on light blue)
    };
  } else if (days <= 90) {
    // 1–3 months → ORANGE
    return {
      iconColor: "#f59e0b", // Amber-500
      iconBackgroundColor: "#ffffff", // White
      cardBackground: "#fef3c7", // Amber-100 (light tint)
      cardBorder: "#f59e0b", // Amber-500 (solid border)
      valueColor: "#b45309", // Amber-700 (readable on light amber)
    };
  } else {
    // 3+ months → RED
    return {
      iconColor: "#dc2626", // Red-600
      iconBackgroundColor: "#ffffff", // White
      cardBackground: "#fee2e2", // Red-100 (light tint)
      cardBorder: "#dc2626", // Red-600 (solid border)
      valueColor: "#991b1b", // Red-800 (readable on light red)
    };
  }
};

export function RepairDetailsDrawer({ isOpen, onClose, repair, onRepairUpdate }: RepairDetailsDrawerProps) {
  const statusHistory = getStatusHistory(repair);
  const attachmentImages = getAttachments(repair);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [customerReferences, setCustomerReferences] = useState<CustomerReference[]>(INITIAL_CUSTOMER_REFERENCES);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const workScopeItems = INITIAL_WORK_SCOPE_ITEMS;
  const [note, setNote] = useState<string>("");

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !repair) {
    return null;
  }

  // Mock quote data - in production, this would come from the repair object or API
  const quoteDate = repair.status === "Awaiting Quote" ? null : new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const hasQuote = repair.quote > 0 && quoteDate !== null;
  const workScope = repair.quote > 0 
    ? "Complete disassembly, cleaning, and inspection of all components. Replacement of worn seals and bearings. Recalibration of pressure sensors and testing of all safety systems. Full functional testing and certification."
    : null;

  const handleApprove = () => {
    if (repair) {
      setIsApproveModalOpen(true);
    }
  };

  const handleReject = () => {
    if (repair) {
      setIsRejectModalOpen(true);
    }
  };

  const handleApproveSubmit = (_poNumber: string) => {
    if (repair && onRepairUpdate) {
      onRepairUpdate(repair.rrNumber, {
        status: "In Progress",
      });
    }
  };

  const handleRejectSubmit = (reason: string, _disposition: string) => {
    if (repair && onRepairUpdate) {
      const newStatus: RepairStatus = reason === "Warranty Recapture" ? "Not Repairable" : "Rejected";
      onRepairUpdate(repair.rrNumber, {
        status: newStatus,
      });
    }
  };

  const handleEditReference = (id: number, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const handleSaveReference = (id: number) => {
    setCustomerReferences((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, value: editValue } : ref))
    );
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Only show action buttons when status is "Awaiting Approval"
  const showActionButtons = repair.status === "Awaiting Approval";

  return (
    <>
      {/* Backdrop overlay */}
      <div className="repair-details-overlay" onClick={onClose} />

      {/* Drawer */}
      <aside className="repair-details-drawer">
        {/* Header */}
        <div className="repair-details-header">
          <div className="repair-details-header-main">
            <div className="repair-details-header-row">
              <h2 className="repair-details-title">{repair.rrNumber}</h2>
              <div className="repair-details-header-status">
                <StatusBadge status={repair.status} />
              </div>
            </div>
          </div>
          <div className="repair-details-header-actions">
            <button
              className="repair-details-icon-button"
              onClick={() => console.log("Download", repair.rrNumber)}
              aria-label="Download"
            >
              <ArrowDownTrayIcon className="repair-details-icon-button-icon" />
            </button>
            <button
              className="repair-details-icon-button"
              onClick={onClose}
              aria-label="Close drawer"
            >
              <XMarkIcon className="repair-details-icon-button-icon" />
            </button>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="repair-details-body">
          {/* Left Column - Main Content */}
          <div className="repair-details-main">
            {/* Quote Summary */}
            <div className="repair-details-quote-summary">
              <div className="repair-details-quote-summary-top">
                <div className="repair-details-quote-summary-field">
                  <div className="repair-details-quote-summary-label">Quote Date</div>
                  <div className="repair-details-quote-summary-value">
                    {quoteDate 
                      ? quoteDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </div>
                </div>
                <div className="repair-details-quote-summary-field repair-details-quote-summary-field--price">
                  <div className="repair-details-quote-summary-label">Repair Price</div>
                  <div className="repair-details-quote-summary-value repair-details-quote-summary-value--price">
                    {hasQuote ? formatCurrency(repair.quote) : "—"}
                  </div>
                </div>
              </div>

              {/* Days in Progress Row - Only show for "In Progress" status */}
              {repair && repair.status === "In Progress" && (
                <>
                  <div className="repair-details-quote-summary-divider"></div>
                  <div 
                    className="repair-details-quote-summary-days-card"
                    style={{
                      backgroundColor: getDaysInProgressColor(repair.daysInProgress).cardBackground,
                      borderColor: getDaysInProgressColor(repair.daysInProgress).cardBorder,
                    }}
                  >
                    <div className="repair-details-quote-summary-top">
                      <div className="repair-details-quote-summary-field">
                        <div className="repair-details-quote-summary-days-row">
                          <div 
                            className="repair-details-quote-summary-days-icon-container"
                            style={{
                              backgroundColor: getDaysInProgressColor(repair.daysInProgress).iconBackgroundColor,
                            }}
                          >
                            <ClockIcon 
                              className="repair-details-quote-summary-days-icon"
                              style={{
                                color: getDaysInProgressColor(repair.daysInProgress).iconColor,
                              }}
                            />
                          </div>
                          <div className="repair-details-quote-summary-days-content">
                            <div className="repair-details-quote-summary-label">Days in Progress</div>
                            <div 
                              className="repair-details-quote-summary-value repair-details-quote-summary-value--days"
                              style={{
                                color: getDaysInProgressColor(repair.daysInProgress).valueColor,
                              }}
                            >
                              {repair.daysInProgress} {repair.daysInProgress === 1 ? "day" : "days"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="repair-details-quote-summary-field repair-details-quote-summary-field--price">
                        <div className="repair-details-quote-summary-label">Expected Completion</div>
                        <div className="repair-details-quote-summary-value">
                          {repair.eta || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Work Scope Text */}
              <div className="repair-details-quote-summary-scope">
                <div className="repair-details-quote-summary-label">WORK SCOPE</div>
                <div className="repair-details-quote-summary-scope-content">
                  {workScope || "—"}
                </div>
              </div>

              {/* Work Scope Table */}
              <div className="repair-details-quote-summary-table-wrapper">
                <table className="repair-details-work-scope-table">
                  <thead>
                    <tr>
                      <th>Part / Description</th>
                      <th>Qty</th>
                      <th className="repair-details-work-scope-numeric">Unit Price</th>
                      <th className="repair-details-work-scope-numeric">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workScopeItems.length > 0 ? (
                      workScopeItems.map((item) => (
                        <tr key={item.id}>
                          <td className="repair-details-work-scope-part-desc">
                            <div className="repair-details-work-scope-part-number">{item.partNumber}</div>
                            <div className="repair-details-work-scope-description-text">{item.description}</div>
                          </td>
                          <td className="repair-details-work-scope-qty">{item.qty}</td>
                          <td className="repair-details-work-scope-numeric">
                            {formatCurrency(item.total / item.qty)}
                          </td>
                          <td className="repair-details-work-scope-numeric">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="repair-details-work-scope-empty">
                          No line items available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons Row */}
              {showActionButtons && (
                <div className="repair-details-quote-summary-actions">
                  <button
                    type="button"
                    className="repair-details-action-button repair-details-action-button--primary"
                    onClick={handleApprove}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="repair-details-action-button repair-details-action-button--reject"
                    onClick={handleReject}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            {/* Request Details */}
            <div className="repair-details-request-details">
              <h3 className="repair-details-request-details-title">Request Details</h3>
              <div className="repair-details-request-details-grid">
                <div className="repair-details-request-details-column">
                  <div className="repair-details-meta-item">
                    <div className="repair-details-meta-label">Department</div>
                    <div className="repair-details-meta-value">—</div>
                  </div>
                  <div className="repair-details-meta-item">
                    <div className="repair-details-meta-label">Machine/Asset</div>
                    <div className="repair-details-meta-value">—</div>
                  </div>
                  <div className="repair-details-meta-item">
                    <div className="repair-details-meta-label">Customer Stated Issue</div>
                    <div className="repair-details-meta-value">Locked up</div>
                  </div>
                </div>
                <div className="repair-details-request-details-column">
                  <div className="repair-details-meta-item">
                    <div className="repair-details-meta-label">Description</div>
                    <div className="repair-details-meta-value">Repair of Waukesha Positive Displacement Pump, PN: U1015</div>
                  </div>
                  <div className="repair-details-meta-item">
                    <div className="repair-details-meta-label">Bill To</div>
                    <div className="repair-details-meta-value">Door 16, 1001 Texas Central Parkway, Waco, Texas, USA, 76712, 8888888888</div>
                  </div>
                  <div className="repair-details-meta-item">
                    <div className="repair-details-meta-label">Ship To</div>
                    <div className="repair-details-meta-value">Door 16, 1001 Texas Central Parkway, Waco, Texas, USA, 76712, 8888888888</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer References */}
            <div className="repair-details-customer-references">
              <h3 className="repair-details-customer-references-title">Customer References</h3>
              <table className="repair-details-customer-references-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reference Name</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customerReferences.map((ref, index) => (
                    <tr key={ref.id}>
                      <td className="repair-details-customer-references-index">{index + 1}</td>
                      <td className="repair-details-customer-references-name">{ref.name}</td>
                      <td className="repair-details-customer-references-value">
                        {editingId === ref.id ? (
                          <input
                            type="text"
                            className="repair-details-customer-references-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <span>{ref.value}</span>
                        )}
                      </td>
                      <td className="repair-details-customer-references-actions">
                        {editingId === ref.id ? (
                          <>
                            <button
                              type="button"
                              className="repair-details-customer-references-action-btn"
                              onClick={() => handleSaveReference(ref.id)}
                              aria-label="Save"
                            >
                              <CheckIcon className="repair-details-customer-references-action-icon" />
                            </button>
                            <button
                              type="button"
                              className="repair-details-customer-references-action-btn"
                              onClick={handleCancelEdit}
                              aria-label="Cancel"
                            >
                              <XMarkIcon className="repair-details-customer-references-action-icon" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="repair-details-customer-references-action-btn"
                            onClick={() => handleEditReference(ref.id, ref.value)}
                            aria-label="Edit"
                          >
                            <PencilIcon className="repair-details-customer-references-action-icon" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="repair-details-sidebar">
            {/* Attachments Card */}
            <div className="repair-details-sidebar-card">
              <h3 className="repair-details-sidebar-card-title">Attachments</h3>
              <AttachmentViewer images={attachmentImages} />
            </div>

            {/* Status Progress Card */}
            <div className="repair-details-sidebar-card">
              <h3 className="repair-details-sidebar-card-title">Status Progress</h3>
              <div className="repair-details-status-progress-timeline">
                {statusHistory.map((historyItem, index) => {
                  const isCurrent = historyItem.status === repair.status;
                  const isPast = !isCurrent;
                  
                  return (
                    <div
                      key={`progress-${historyItem.status}-${index}`}
                      className={`repair-details-status-progress-timeline-item ${
                        isCurrent ? "repair-details-status-progress-timeline-item--current" : ""
                      } ${isPast ? "repair-details-status-progress-timeline-item--past" : ""}`}
                    >
                      <div className="repair-details-status-progress-timeline-icon">
                        {isPast && <CheckCircleIcon className="repair-details-status-progress-timeline-check" />}
                        {isCurrent && <div className="repair-details-status-progress-timeline-dot" />}
                      </div>
                      <div className="repair-details-status-progress-timeline-content">
                        <div className="repair-details-status-progress-timeline-status">
                          <div className="repair-details-status-progress-timeline-pill">
                            <StatusBadge status={historyItem.status} />
                          </div>
                        </div>
                        <div className="repair-details-status-progress-timeline-date">{historyItem.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Note Card */}
            <div className="repair-details-sidebar-card">
              <h3 className="repair-details-sidebar-card-title">Note</h3>
              <textarea
                className="repair-details-note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => {
                  // Auto-save on blur (could be extended to save to backend)
                  console.log("Note saved:", note);
                }}
                placeholder="Add a note for this repair…"
                rows={4}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Approve Modal */}
      {repair && (
        <ApproveModal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          onSubmit={handleApproveSubmit}
          quoteAmount={repair.quote}
        />
      )}

      {/* Reject Modal */}
      {repair && (
        <RejectModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onSubmit={handleRejectSubmit}
        />
      )}
    </>
  );
}
