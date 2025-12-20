"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getUserInitials } from "@/app/lib/userUtils";

interface ProfileImageProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackName?: string;
  showInitials?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  src,
  alt = "Profile",
  size = 160,
  className = "",
  fallbackName = "User",
  showInitials = true,
  priority = false,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const defaultAvatar = "/images/user/spartan.jpg";

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getImageSrc = (): string => {
    if (imageError || !src) {
      return defaultAvatar;
    }
    return src;
  };

  const shouldShowInitials =
    showInitials && (imageError || !src) && fallbackName;
  const initials = shouldShowInitials ? getUserInitials(fallbackName) : "";

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      onClick={onClick}
    >
      {/* Loading spinner */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      )}

      {/* Profile image */}
      <div
        className={`relative h-full w-full transition-opacity duration-300 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={getImageSrc()}
          alt={alt}
          fill
          className="rounded-full object-cover"
          sizes={`${size}px`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          priority={priority}
        />
      </div>

      {/* Initials fallback overlay */}
      {shouldShowInitials && !imageLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-primary font-semibold text-white"
          style={{ fontSize: `${size * 0.4}px` }}
        >
          {initials}
        </div>
      )}

      {/* Hover overlay for clickable images */}
      {onClick && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-0 transition-opacity duration-200 hover:bg-opacity-20">
          <div className="opacity-0 transition-opacity duration-200 hover:opacity-100">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;
