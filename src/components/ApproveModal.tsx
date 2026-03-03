import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ApproveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (poNumber: string) => void;
  quoteAmount: number;
};

export function ApproveModal({ isOpen, onClose, onSubmit, quoteAmount }: ApproveModalProps) {
  const [poNumber, setPoNumber] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus first input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
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
    setPoNumber("");
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poNumber.trim()) {
      setError("Customer PO # is required");
      inputRef.current?.focus();
      return;
    }

    onSubmit(poNumber.trim());
    handleClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="approve-modal-overlay">
      <div className="approve-modal-dialog" ref={dialogRef}>
        <div className="approve-modal-header">
          <div>
            <h3 className="approve-modal-title">Blanket PO Details</h3>
            <div className="approve-modal-meta">Quote Amount: {formatCurrency(quoteAmount)}</div>
          </div>
          <button
            type="button"
            className="approve-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="approve-modal-close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="approve-modal-body">
            <div className="approve-modal-field">
              <div className="approve-modal-field-row">
                <div className="approve-modal-label">Approve Type:</div>
                <div className="approve-modal-value">Custom PO</div>
              </div>
            </div>

            <div className="approve-modal-field">
              <label className="approve-modal-input-label">
                Enter Customer PO # <span className="approve-modal-required">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                className={`approve-modal-input ${error ? "approve-modal-input--error" : ""}`}
                placeholder="Customer PO #"
                value={poNumber}
                onChange={(e) => {
                  setPoNumber(e.target.value);
                  if (error) setError("");
                }}
              />
              {error && <div className="approve-modal-error">{error}</div>}
            </div>
          </div>

          <div className="approve-modal-footer">
            <button
              type="button"
              className="approve-modal-button approve-modal-button--secondary"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="approve-modal-button approve-modal-button--primary"
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


