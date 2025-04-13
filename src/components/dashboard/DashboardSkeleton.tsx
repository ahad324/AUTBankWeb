"use client";

import Skeleton from "@/components/common/Skeleton";
import React from "react";

interface Section {
  cols: number;
  height: string;
}

interface DashboardSkeletonProps {
  sections?: Section[];
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  sections = [
    { cols: 3, height: "12rem" },
    { cols: 1, height: "16rem" },
    { cols: 2, height: "20rem" },
  ],
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <Skeleton variant="text" width={200} height={32} />
        <div className="flex space-x-2">
          <Skeleton variant="rect" width={100} height={36} />
          <Skeleton variant="rect" width={100} height={36} />
        </div>
      </div>

      {/* Dynamic Sections */}
      {sections.map((section, index) => (
        <div
          key={index}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${section.cols} gap-4`}
        >
          {Array.from({ length: section.cols }).map((_, i) => (
            <Skeleton key={i} variant="card" height={section.height} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default DashboardSkeleton;
