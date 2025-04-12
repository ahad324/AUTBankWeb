// src/components/dashboard/DashboardSkeleton.tsx
import Skeleton from "@/components/common/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Skeleton variant="text" width="20rem" height="2.5rem" className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Stats Card */}
        <Skeleton
          variant="card"
          className="col-span-1 lg:col-span-2"
          height="12rem"
        />
        {/* Quick Actions Card */}
        <Skeleton variant="card" height="12rem" />
        {/* User Distribution Chart */}
        <Skeleton variant="card" height="12rem" />
        {/* Transaction Volume Chart */}
        <Skeleton
          variant="card"
          className="col-span-1 lg:col-span-2"
          height="18rem"
        />
        {/* Loan Stats Card */}
        <Skeleton variant="card" height="12rem" />
        {/* Loan Trends Chart */}
        <Skeleton
          variant="card"
          className="col-span-1 lg:col-span-3"
          height="18rem"
        />
        {/* Recent Activity Card */}
        <Skeleton variant="card" className="col-span-1" height="12rem" />
      </div>
    </div>
  );
}
