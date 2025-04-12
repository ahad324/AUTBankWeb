"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileText } from "lucide-react";
import api from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { memo, useCallback } from "react";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

// Interfaces matching API response
interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

interface TransactionVolume {
  total_volume: number;
  deposits: number;
  transfers: number;
  withdrawals: number;
}

interface LoanStats {
  total_approved_amount: number;
  total_approved_count: number;
  pending_count: number;
  pending_amount: number;
}

interface AnalyticsData {
  users: UserStats;
  transactions: TransactionVolume;
  loans: LoanStats;
  average_user_balance: number;
}

// Chart colors using theme variables with fallbacks
const CHART_COLORS = [
  "var(--chart-2, #22c55e)", // Greenish for approved
  "var(--destructive, #ef4444)", // Red for pending
  "var(--chart-1, #3b82f6)",
];

// Memoized User Stats Card
const UserStatsCard = memo(({ stats }: { stats: UserStats }) => (
  <Card className="relative bg-gradient-to-br from-card to-muted/30 border-border col-span-1 sm:col-span-2 lg:col-span-3 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)/10,transparent_70%)] opacity-50" />
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl font-semibold text-foreground">
        User Overview
      </CardTitle>
      <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
    </CardHeader>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
      <div className="text-center bg-card/80 rounded-lg p-4">
        <p
          className="text-5xl font-extrabold text-foreground"
          aria-label="Total users"
        >
          {stats.total}
        </p>
        <p className="text-sm text-muted-foreground mt-2">Total Users</p>
      </div>
      <div className="text-center bg-card/80 rounded-lg p-4">
        <p
          className="text-5xl font-extrabold text-[var(--chart-2,#22c55e)]"
          aria-label="Active users"
        >
          {stats.active}
        </p>
        <p className="text-sm text-muted-foreground mt-2">Active Users</p>
      </div>
      <div className="text-center bg-card/80 rounded-lg p-4">
        <p
          className="text-5xl font-extrabold text-[var(--destructive,#ef4444)]"
          aria-label="Inactive users"
        >
          {stats.inactive}
        </p>
        <p className="text-sm text-muted-foreground mt-2">Inactive Users</p>
      </div>
    </CardContent>
  </Card>
));
UserStatsCard.displayName = "UserStatsCard";

// Memoized Transaction Volume Card
const TransactionVolumeCard = memo(
  ({ volume }: { volume: TransactionVolume }) => {
    const chartData = [
      { name: "Deposits", value: volume.deposits },
      { name: "Transfers", value: volume.transfers },
      { name: "Withdrawals", value: volume.withdrawals },
    ];

    return (
      <Card className="bg-gradient-to-br from-card to-muted/30 border-border col-span-1 sm:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">
            Transaction Volume
          </CardTitle>
          <DollarSign
            className="h-6 w-6 text-muted-foreground"
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p
              className="text-4xl font-bold text-[var(--primary,#2dd4bf)]"
              aria-label="Total transaction volume"
            >
              ${volume.total_volume.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total Transaction Volume
            </p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              aria-label="Transaction volume breakdown"
            >
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                tick={{ fill: "hsl(var(--foreground))" }}
                fontSize={12}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fill: "hsl(var(--foreground))" }}
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px hsl(var(--shadow)/0.1)",
                }}
              />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }
);
TransactionVolumeCard.displayName = "TransactionVolumeCard";

// Memoized Loan Stats Card
const LoanStatsCard = memo(({ stats }: { stats: LoanStats }) => {
  const chartData = [
    { name: "Approved", value: stats.total_approved_count },
    { name: "Pending", value: stats.pending_count },
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-border col-span-1 sm:col-span-2 lg:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-foreground">
          Loan Metrics
        </CardTitle>
        <FileText
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Approved:</span>
            <span
              className="font-semibold text-foreground"
              aria-label="Total approved amount"
            >
              ${stats.total_approved_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-muted-foreground">Pending Amount:</span>
            <span
              className="font-semibold text-[var(--chart-3, #facc15)]"
              aria-label="Pending amount"
            >
              ${stats.pending_amount.toLocaleString()}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart aria-label="Loan status distribution">
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value, "Count"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px hsl(var(--shadow)/0.1)",
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-foreground text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
LoanStatsCard.displayName = "LoanStatsCard";

// Memoized Quick Actions Card
const QuickActionsCard = memo(() => (
  <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl font-semibold text-foreground">
        Quick Actions
      </CardTitle>
      <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Button
        asChild
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground py-6 text-base rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      >
        <Link href="/dashboard/users/add">Add New User</Link>
      </Button>
      <Button
        asChild
        className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground py-6 text-base rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      >
        <Link href="/dashboard/deposits/process">Process Deposit</Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground py-6 text-base rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
      >
        <Link href="/dashboard/loans">Review Loans</Link>
      </Button>
    </CardContent>
  </Card>
));
QuickActionsCard.displayName = "QuickActionsCard";

// Memoized Average Balance Card
const AverageBalanceCard = memo(({ balance }: { balance: number }) => (
  <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl font-semibold text-foreground">
        User Balance
      </CardTitle>
      <DollarSign
        className="h-6 w-6 text-muted-foreground"
        aria-hidden="true"
      />
    </CardHeader>
    <CardContent className="text-center">
      <p
        className="text-5xl font-extrabold text-[var(--primary,#2dd4bf)]"
        aria-label="Average user balance"
      >
        ${balance.toLocaleString()}
      </p>
      <p className="text-sm text-muted-foreground mt-2">Average User Balance</p>
    </CardContent>
  </Card>
));
AverageBalanceCard.displayName = "AverageBalanceCard";

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await api.get("/admins/analytics/summary");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const handleRetry = useCallback(() => {
    refetch();
    toast.info("Retrying to load analytics...");
  }, [refetch]);

  if (isLoading) {
    return (
      <DashboardSkeleton
        sections={[
          { cols: 3, height: "12rem" },
          { cols: 1, height: "16rem" },
          { cols: 2, height: "20rem" },
          { cols: 1, height: "16rem" },
          { cols: 1, height: "12rem" },
        ]}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-[var(--destructive,#ef4444)] text-xl font-medium">
          Unable to load analytics
        </p>
        <Button
          onClick={handleRetry}
          variant="outline"
          className="border-[var(--primary,#2dd4bf)] text-[var(--primary,#2dd4bf)] hover:bg-[var(--primary,#2dd4bf)] hover:text-primary-foreground"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <section className="py-8 space-y-8" aria-label="Dashboard overview">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          aria-label="Refresh dashboard data"
        >
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </Button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
        <UserStatsCard stats={data!.users} />
        <QuickActionsCard />
        <TransactionVolumeCard volume={data!.transactions} />
        <LoanStatsCard stats={data!.loans} />
        <AverageBalanceCard balance={data!.average_user_balance} />
      </div>
    </section>
  );
}
