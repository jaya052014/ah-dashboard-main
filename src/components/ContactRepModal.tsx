import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ContactRepModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContactRepModal({ isOpen, onClose }: ContactRepModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="contact-rep-modal-overlay">
      <div className="contact-rep-modal-dialog" ref={dialogRef}>
        <div className="contact-rep-modal-header">
          <h3 className="contact-rep-modal-title">Contact Your AH Rep</h3>
          <button
            type="button"
            className="contact-rep-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XMarkIcon className="contact-rep-modal-close-icon" />
          </button>
        </div>

        <div className="contact-rep-modal-body">
          {/* Account Manager Section */}
          <div className="contact-rep-section">
            <div className="contact-rep-section-label">Account Manager</div>
            <div className="contact-rep-section-content">
              <div className="contact-rep-field">
                <div className="contact-rep-field-label">Name</div>
                <div className="contact-rep-field-value">John Smith</div>
              </div>
              <div className="contact-rep-field">
                <div className="contact-rep-field-label">Phone</div>
                <a href="tel:+13125550198" className="contact-rep-field-link">
                  +1 (312) 555-0198
                </a>
              </div>
              <div className="contact-rep-field">
                <div className="contact-rep-field-label">Email</div>
                <a href="mailto:john.smith@ahgroup.com" className="contact-rep-field-link">
                  john.smith@ahgroup.com
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="contact-rep-divider" />

          {/* Customer Service Section */}
          <div className="contact-rep-section">
            <div className="contact-rep-section-label">General Customer Service</div>
            <div className="contact-rep-section-content">
              <div className="contact-rep-field">
                <a href="mailto:support@ahgroup.com" className="contact-rep-field-link">
                  support@ahgroup.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
