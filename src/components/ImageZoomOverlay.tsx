import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ImageZoomOverlayProps = {
  image: string;
  onClose: () => void;
};

export function ImageZoomOverlay({ image, onClose }: ImageZoomOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    // Prevent body scroll when overlay is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Handle click outside image (but not on the image itself)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicking the overlay background, not the image or close button
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Focus trap: focus the close button on mount
  useEffect(() => {
    // Use setTimeout to ensure the DOM is ready
    const timer = setTimeout(() => {
      const closeButton = overlayRef.current?.querySelector(
        ".image-zoom-overlay-close"
      ) as HTMLButtonElement;
      if (closeButton) {
        closeButton.focus();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const overlayContent = (
    <div
      ref={overlayRef}
      className="image-zoom-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Zoomed image view"
    >
      <button
        className="image-zoom-overlay-close"
        onClick={onClose}
        aria-label="Close zoomed image"
        type="button"
      >
        <XMarkIcon className="image-zoom-overlay-close-icon" />
      </button>
      <div className="image-zoom-overlay-content" onClick={(e) => e.stopPropagation()}>
        <img
          key={image}
          ref={imageRef}
          src={image}
          alt="Zoomed attachment"
          className="image-zoom-overlay-image"
        />
      </div>
    </div>
  );

  return createPortal(overlayContent, document.body);
}

