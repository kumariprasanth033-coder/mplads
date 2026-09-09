import React, { useState } from 'react';
import { getDefaultProjectImage, getSvgFallbackDataUri } from '../utils/projectImageUtils';

interface ProjectImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  code?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Robust Project Image Component with multi-tiered fallback
 * If the primary image fails to load or is missing, falls back to:
 * 1. Category-specific official development work image
 * 2. Guaranteed SVG vector fallback illustration
 * Prevents broken images, blank boxes, or layout shifts across the portal.
 */
export const ProjectImage: React.FC<ProjectImageProps> = ({
  src,
  alt,
  category,
  code = 'MPLADS',
  className = 'w-full h-full object-cover',
  loading = 'lazy',
}) => {
  const fallbackUrl = getDefaultProjectImage(category);
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackUrl);
  const [retryStage, setRetryStage] = useState<number>(src ? 0 : 1);

  const handleError = () => {
    if (retryStage === 0) {
      // Primary failed -> switch to thematic category development work image
      setRetryStage(1);
      setCurrentSrc(fallbackUrl);
    } else if (retryStage === 1) {
      // Thematic failed -> switch to guaranteed inline SVG vector illustration
      setRetryStage(2);
      setCurrentSrc(getSvgFallbackDataUri(category || 'Development Work', code));
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
};
