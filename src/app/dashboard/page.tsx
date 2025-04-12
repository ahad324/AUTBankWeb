// src/app/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Activity,
} from "lucide-react";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await api.get("/admins/analytics/summary");
      return response.data.data;
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    toast.error("Failed to load analytics");
    return <div className="text-destructive">Error loading analytics</div>;
  }

  const userStats = data?.userStats || { total: 0, active: 0, inactive: 0 };
  const loanStats = data?.loanStats || {
    totalApproved: 0,
    pending: 0,
    repaid: 0,
  };
  const transactionVolume = data?.transactionVolume || {
    deposits: 0,
    transfers: 0,
    withdrawals: 0,
  };
  const recentActivity = data?.recentActivity || [];

  // Data for charts
  const transactionChartData = [
    { name: "Deposits", value: transactionVolume.deposits },
    { name: "Transfers", value: transactionVolume.transfers },
    { name: "Withdrawals", value: transactionVolume.withdrawals },
  ];

  const userDistributionData = [
    { name: "Active", value: userStats.active },
    { name: "Inactive", value: userStats.inactive },
  ];

  const loanTrendData = [
    { name: "Jan", approved: 400, pending: 240 },
    { name: "Feb", approved: 300, pending: 139 },
    { name: "Mar", approved: 500, pending: 200 },
    { name: "Apr", approved: 278, pending: 390 },
    { name: "May", approved: 189, pending: 480 },
    { name: "Jun", approved: 239, pending: 380 },
  ]; // Mock data; replace with real data from API

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6"];

  return (
    <section className="space-y-6">
      <h1>Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* User Stats */}
        <Card className="bg-gradient-to-br from-card to-muted/50 border-border col-span-1 lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              User Statistics
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">
                {userStats.total}
              </p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">
                {userStats.active}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-500">
                {userStats.inactive}
              </p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Quick Actions
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground transition-all duration-300"
            >
              <a href="/dashboard/users/add">Add New User</a>
            </Button>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground transition-all duration-300"
            >
              <a href="/dashboard/deposits/process">Process Deposit</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <a href="/dashboard/loans">Review Loans</a>
            </Button>
          </CardContent>
        </Card>

        {/* User Distribution (Donut Chart) */}
        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              User Distribution
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Volume (Bar Chart) */}
        <Card className="bg-gradient-to-br from-card to-muted/50 border-border col-span-1 lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Transaction Volume
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionChartData}>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Stats */}
        <Card className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Loan Statistics
            </CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Approved:</span>
              <span className="font-semibold text-foreground">
                ${loanStats.totalApproved.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending:</span>
              <span className="font-semibold text-yellow-500">
                {loanStats.pending}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repaid:</span>
              <span className="font-semibold text-green-500">
                {loanStats.repaid}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Loan Trends (Line Chart) */}
        <Card className="bg-gradient-to-br from-card to-muted/50 border-border col-span-1 lg:col-span-3 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Loan Trends (Last 6 Months)
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={loanTrendData}>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border col-span-1 lg:col-span-1 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Recent Activity
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.slice(0, 3).map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm text-foreground">
                    {activity.description || "Activity occurred"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
