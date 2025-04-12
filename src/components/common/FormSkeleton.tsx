// src/components/common/FormSkeleton.tsx
import Skeleton from "@/components/common/Skeleton";

interface FormSkeletonProps {
  fields?: number;
}

export default function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" width="15rem" height="2rem" />
      <div className="space-y-4 p-6 border rounded-xl">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton variant="text" width="8rem" height="1rem" />
            <Skeleton variant="rect" height="2.25rem" />
          </div>
        ))}
        <Skeleton variant="rect" width="10rem" height="2.5rem" />
      </div>
    </div>
  );
}
