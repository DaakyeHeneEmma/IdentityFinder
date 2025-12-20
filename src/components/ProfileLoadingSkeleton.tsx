"use client";

import React from "react";

interface ProfileLoadingSkeletonProps {
  showRefreshButton?: boolean;
}

const ProfileLoadingSkeleton: React.FC<ProfileLoadingSkeletonProps> = ({
  showRefreshButton = false,
}) => {
  return (
    <div className="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Cover Image Skeleton */}
      <div className="relative z-20 h-35 md:h-65">
        <div className="h-full w-full animate-pulse rounded-tl-sm rounded-tr-sm bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
        {/* Profile Image Skeleton */}
        <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
          <div className="relative flex drop-shadow-2">
            <div className="h-30 w-30 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700 sm:h-40 sm:w-40"></div>
          </div>
        </div>

        <div className="mt-4">
          {/* Edit Profile Button Skeleton */}
          <div className="right-1 z-10 mb-4 ml-6 mr-6 mt-2 flex justify-center gap-2 xsm:bottom-4 xsm:right-4">
            <div className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            {showRefreshButton && (
              <div className="h-9 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            )}
          </div>

          {/* Name Skeleton */}
          <div className="mb-1.5 mx-auto h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>

          {/* Occupation Skeleton */}
          <div className="mb-2 mx-auto h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>

          {/* Phone Number Skeleton */}
          <div className="mb-2 mx-auto h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>

          {/* Email Skeleton */}
          <div className="mb-4 mx-auto h-3 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>

          {/* Stats Card Skeleton */}
          <div className="mx-auto mb-5.5 mt-4.5 max-w-94 rounded-md border border-stroke py-2.5 shadow-1 dark:border-strokedark dark:bg-[#37404F]">
            <div className="grid grid-cols-3">
              {/* Reported Cards Stat */}
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <div className="h-6 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Found Cards Stat */}
              <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 dark:border-strokedark xsm:flex-row">
                <div className="h-6 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Rewards Stat */}
              <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-14 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>

          {/* About Me Section Skeleton */}
          <div className="mx-auto max-w-180">
            <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Social Links Section Skeleton */}
          <div className="mt-6.5">
            <div className="mb-3.5 mx-auto h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center justify-center gap-3.5">
              {/* Social Icon Skeletons */}
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pulse Animation Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>
  );
};

export default ProfileLoadingSkeleton;
