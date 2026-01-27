"use client";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { useMemo, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Transaction = {
  date: Date;
  type: string;
  amount: number;
};

type DateRangeKey = "7D" | "1M" | "3M" | "6M" | "ALL";

type GroupedData = {
  date: string;
  income: number;
  expense: number;
};

const DATE_RANGES: Record<
  DateRangeKey,
  { label: string; days: number | null }
> = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const AccountChart = ({ transactions }: { transactions: Transaction[] }) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t: Transaction) =>
        new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now),
    );

    // Group transactions by date
    const grouped = filtered.reduce(
      (acc: Record<string, GroupedData>, transaction: Transaction) => {
        const date = format(new Date(transaction.date), "MMM dd");
        if (!acc[date]) {
          acc[date] = { date, income: 0, expense: 0 };
        }
        if (transaction.type === "INCOME") {
          acc[date].income += transaction.amount;
        } else {
          acc[date].expense += transaction.amount;
        }
        return acc;
      },
      {},
    );

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a: GroupedData, b: GroupedData) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 },
    );
  }, [filteredData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-normal">
          Transaction Overview
        </CardTitle>
        <Select
          defaultValue={dateRange}
          onValueChange={(value) => setDateRange(value as DateRangeKey)}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => {
              return (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <CardAction>Card Action</CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-green-600">
              Rs {totals.income.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Total Expense</p>
            <p className="text-lg font-bold text-red-600">
              Rs {totals.expense.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Net</p>
            <p
              className={`text-lg font-bold ${totals.income - totals.expense >= 0 ? "text-green-600" : "text-red-700"}`}
            >
              Rs {(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="w-full h-75 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis width={60} />
              <Legend />
              <Tooltip />
              <Line
                type="natural"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                connectNulls
                name="Income"
              />
              <Line
                type="natural"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                connectNulls
                name="Expense"
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="none"
                fill="#22c55e33"
                connectNulls
                dot={false}
                activeDot={false}
                legendType="none"
                tooltipType="none"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="none"
                fill="#ef444433"
                connectNulls
                dot={false}
                activeDot={false}
                legendType="none"
                tooltipType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountChart;
