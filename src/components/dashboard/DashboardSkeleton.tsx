import Skeleton from "@/components/common/Skeleton";

interface DashboardSkeletonProps {
  sections: { cols: number; height: string }[];
}

export default function DashboardSkeleton({
  sections,
}: DashboardSkeletonProps) {
  return (
    <div className="py-8 space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, index) => (
          <Skeleton
            key={index}
            className={`col-span-${section.cols} h-[${section.height}] rounded-lg`}
          />
        ))}
      </div>
    </div>
  );
}
