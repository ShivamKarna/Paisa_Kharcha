"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SerializedTransaction } from "@/actions/dashboard";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS = [
  "#FF1744", // Vibrant Red
  "#00E676", // Bright Green
  "#2979FF", // Electric Blue
  "#FF9100", // Vivid Orange
  "#D500F9", // Vivid Purple
  "#00E5FF", // Cyan
  "#FFEA00", // Bright Yellow
  "#FF3D00", // Deep Orange
];

interface Account {
  id: string;
  name: string;
  isDefault?: boolean;
}

interface DashboardOverviewProps {
  accounts: Account[];
  transactions: SerializedTransaction[];
}

export default function DashboardOverview({
  accounts,
  transactions,
}: DashboardOverviewProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a: Account) => a.isDefault)?.id || accounts[0]?.id,
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter transactions for selected account
  const accountTransactions = transactions.filter(
    (t: SerializedTransaction) => t.accountId === selectedAccountId,
  );

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort(
      (a: SerializedTransaction, b: SerializedTransaction) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 5);

  // Calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter(
    (t: SerializedTransaction) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === "EXPENSE" &&
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    },
  );

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce(
    (acc: Record<string, number>, transaction: SerializedTransaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Format data for pie chart
  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    }),
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Transactions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account: Account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction: SerializedTransaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center",
                        transaction.type === "EXPENSE"
                          ? "text-red-600"
                          : "text-green-600",
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      )}
                      ${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No expenses this month
            </p>
          ) : (
            <div
              className="w-full"
              style={{ aspectRatio: 1, maxWidth: "500px", maxHeight: "500px" }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart
                  margin={
                    isMobile
                      ? { top: 0, right: 0, bottom: 60, left: 0 }
                      : { top: 20, right: 80, bottom: 20, left: 80 }
                  }
                >
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy={isMobile ? "40%" : "45%"}
                    innerRadius={isMobile ? "50%" : "55%"}
                    outerRadius={isMobile ? "70%" : "75%"}
                    cornerRadius={8}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                    label={
                      !isMobile
                        ? ({ cx, cy, midAngle, outerRadius, name, value }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = (outerRadius || 0) + 30;
                            const angle = midAngle || 0;
                            const x =
                              (cx || 0) + radius * Math.cos(-angle * RADIAN);
                            const y =
                              (cy || 0) + radius * Math.sin(-angle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="currentColor"
                                textAnchor={x > (cx || 0) ? "start" : "end"}
                                dominantBaseline="central"
                                className="text-sm font-medium"
                              >
                                {`${name}: $${value.toFixed(2)}`}
                              </text>
                            );
                          }
                        : false
                    }
                    labelLine={
                      !isMobile
                        ? {
                            stroke: "currentColor",
                            strokeWidth: 1,
                          }
                        : false
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value !== undefined ? `$${value.toFixed(2)}` : "$0.00"
                    }
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={isMobile ? 80 : 50}
                    iconType="circle"
                    wrapperStyle={
                      isMobile ? { fontSize: "12px", paddingTop: "10px" } : {}
                    }
                    formatter={(value, entry) => {
                      const data = entry.payload;
                      return `${value}: $${data?.value.toFixed(2)}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
