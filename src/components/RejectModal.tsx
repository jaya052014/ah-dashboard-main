import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

type RejectReason = "Repair Price Exceeds Cost of New" | "Warranty Recapture" | "Overstock" | "Long Lead Time";
type RejectDisposition = "Scrap" | "Return not repaired";

type RejectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: RejectReason, disposition: RejectDisposition) => void;
};

const REJECT_REASONS: RejectReason[] = [
  "Repair Price Exceeds Cost of New",
  "Warranty Recapture",
  "Overstock",
  "Long Lead Time",
];

const REJECT_DISPOSITIONS: RejectDisposition[] = [
  "Scrap",
  "Return not repaired",
];

export function RejectModal({ isOpen, onClose, onSubmit }: RejectModalProps) {
  const [reason, setReason] = useState<RejectReason | "">("");
  const [disposition, setDisposition] = useState<RejectDisposition | "">("");
  const [reasonError, setReasonError] = useState("");
  const [dispositionError, setDispositionError] = useState("");
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus first radio on open
  useEffect(() => {
    if (isOpen && firstRadioRef.current) {
      const timer = setTimeout(() => {
        firstRadioRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on backdrop click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setReason("");
    setDisposition("");
    setReasonError("");
    setDispositionError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasError = false;

    if (!reason) {
      setReasonError("RR Reject Reason is required");
      hasError = true;
    } else {
      setReasonError("");
    }

    if (!disposition) {
      setDispositionError("RR Disposition is required");
      hasError = true;
    } else {
      setDispositionError("");
    }

    if (hasError) {
      return;
    }

    onSubmit(reason as RejectReason, disposition as RejectDisposition);
    handleClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="reject-modal-overlay">
      <div className="reject-modal-dialog" ref={dialogRef}>
        <div className="reject-modal-header">
          <div>
            <h3 className="reject-modal-title">Reject Customer Quote</h3>
            <p className="reject-modal-description">
              Select a rejection reason and disposition to update this repair request.
            </p>
          </div>
          <button
            type="button"
            className="reject-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="reject-modal-close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="reject-modal-body">
            <div className="reject-modal-section">
              <label className="reject-modal-section-label">
                RR Reject Reason <span className="reject-modal-required">*</span>
              </label>
              <div className="reject-modal-radio-group">
                {REJECT_REASONS.map((option, index) => (
                  <label
                    key={option}
                    className="reject-modal-radio-label"
                  >
                    <input
                      ref={index === 0 ? firstRadioRef : null}
                      type="radio"
                      name="reject-reason"
                      value={option}
                      checked={reason === option}
                      onChange={(e) => {
                        setReason(e.target.value as RejectReason);
                        if (reasonError) setReasonError("");
                      }}
                      className="reject-modal-radio"
                    />
                    <span className="reject-modal-radio-text">{option}</span>
                  </label>
                ))}
              </div>
              {reasonError && <div className="reject-modal-error">{reasonError}</div>}
            </div>

            <div className="reject-modal-section">
              <label className="reject-modal-section-label">
                RR Disposition <span className="reject-modal-required">*</span>
              </label>
              <div className="reject-modal-radio-group">
                {REJECT_DISPOSITIONS.map((option) => (
                  <label
                    key={option}
                    className="reject-modal-radio-label"
                  >
                    <input
                      type="radio"
                      name="reject-disposition"
                      value={option}
                      checked={disposition === option}
                      onChange={(e) => {
                        setDisposition(e.target.value as RejectDisposition);
                        if (dispositionError) setDispositionError("");
                      }}
                      className="reject-modal-radio"
                    />
                    <span className="reject-modal-radio-text">{option}</span>
                  </label>
                ))}
              </div>
              {dispositionError && <div className="reject-modal-error">{dispositionError}</div>}
            </div>
          </div>

          <div className="reject-modal-footer">
            <button
              type="button"
              className="reject-modal-button reject-modal-button--secondary"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="reject-modal-button reject-modal-button--primary"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

