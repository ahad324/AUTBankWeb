import Skeleton from "@/components/common/Skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 5,
  columns = 5,
}: TableSkeletonProps) {
  return (
    <div className="border rounded-md overflow-hidden border-border">
      <div className="bg-card p-4">
        <Skeleton variant="text" width="10rem" height="1.5rem" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex divide-x divide-border">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 p-4">
                <Skeleton variant="text" width="80%" height="1rem" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
