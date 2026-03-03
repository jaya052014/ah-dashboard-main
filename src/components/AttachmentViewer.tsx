import { useState, useEffect, useMemo } from "react";
import { ImageZoomOverlay } from "./ImageZoomOverlay";

type AttachmentViewerProps = {
  images: string[];
};

export function AttachmentViewer({ images }: AttachmentViewerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Filter out failed images and empty/invalid entries
  const validImages = useMemo(() => {
    return images.filter((img) => 
      typeof img === "string" && 
      img.length > 0 && 
      !failedImages.has(img)
    );
  }, [images, failedImages]);

  // Update selected image when images array changes
  useEffect(() => {
    if (validImages.length > 0 && (!selectedImage || !validImages.includes(selectedImage))) {
      setSelectedImage(validImages[0]);
    } else if (validImages.length === 0) {
      setSelectedImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validImages]);

  const handleImageError = (image: string) => {
    console.warn("AttachmentViewer - Image failed to load:", image);
    setFailedImages((prev) => new Set(prev).add(image));
    // Fallback to the first valid image (not failed, not the current failed one)
    if (selectedImage === image) {
      const stillValidImages = images.filter((img) => 
        typeof img === "string" && 
        img.length > 0 && 
        !failedImages.has(img) && 
        img !== image
      );
      if (stillValidImages.length > 0) {
        setSelectedImage(stillValidImages[0]);
      }
    }
  };

  const handleMainImageClick = () => {
    if (currentImage && validImages.includes(currentImage)) {
      setIsZoomOpen(true);
    }
  };

  const handleThumbnailClick = (image: string) => {
    if (validImages.includes(image)) {
      setSelectedImage(image);
    }
  };

  // If no valid images, don't render anything
  if (validImages.length === 0) {
    return null;
  }

  // Show first image as main, images 2-5 as thumbnails (up to 4 thumbnails)
  const mainImage = validImages[0];
  const thumbnails = validImages.length > 1 ? validImages.slice(1, 5) : [];
  const currentImage = selectedImage && validImages.includes(selectedImage) 
    ? selectedImage 
    : mainImage;

  return (
    <>
      <div className="attachment-viewer">
        {/* Main Image */}
        <div
          className="attachment-viewer-main"
          onClick={handleMainImageClick}
          onMouseEnter={() => setHoveredImage(currentImage)}
          onMouseLeave={() => setHoveredImage(null)}
          role="button"
          tabIndex={0}
          aria-label="Click to enlarge image"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMainImageClick();
            }
          }}
        >
          {currentImage && (
            <img
              key={currentImage}
              src={currentImage}
              alt=""
              className="attachment-viewer-main-image"
              onError={() => handleImageError(currentImage)}
            />
          )}
          {hoveredImage === currentImage && (
            <div className="attachment-viewer-hint">Click to enlarge</div>
          )}
        </div>

        {/* Thumbnails Row */}
        {thumbnails.length > 0 && (
          <div className="attachment-viewer-thumbnails">
            {thumbnails.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`attachment-viewer-thumbnail ${
                  currentImage === image ? "attachment-viewer-thumbnail--active" : ""
                }`}
                onClick={() => handleThumbnailClick(image)}
                aria-label={`View attachment ${index + 2}`}
              >
                <img
                  src={image}
                  alt=""
                  className="attachment-viewer-thumbnail-image"
                  onError={() => handleImageError(image)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Overlay */}
      {isZoomOpen && currentImage && validImages.includes(currentImage) && (
        <ImageZoomOverlay image={currentImage} onClose={() => setIsZoomOpen(false)} />
      )}
    </>
  );
}
