"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingBar } from "@/components/ui/loading-bar";
import useFetch from "@/hooks/use-fetch";
import { getTransaction, SerializedTransaction } from "@/actions/transaction";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
  RefreshCw,
  Tag,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

interface TransactionDetailModalProps {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const RECURRING_INTERVALS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionDetailModal = ({
  transactionId,
  isOpen,
  onClose,
}: TransactionDetailModalProps) => {
  const {
    loading,
    fn: fetchTransaction,
    data: transaction,
  } = useFetch<SerializedTransaction, [string]>(getTransaction);

  useEffect(() => {
    if (transactionId && isOpen) {
      fetchTransaction(transactionId);
    }
  }, [transactionId, isOpen, fetchTransaction]);

  const chartData = transaction
    ? [
        {
          name: "Amount",
          value: transaction.amount,
          fill: transaction.type === "EXPENSE" ? "#ef4444" : "#22c55e",
        },
      ]
    : [];

  return (
    <>
      <LoadingBar loading={loading} />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {loading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <>
                  {transaction?.type === "EXPENSE" ? (
                    <ArrowDownRight className="h-6 w-6 text-red-500" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6 text-green-500" />
                  )}
                  Transaction Details
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Amount Card with Chart */}
              <Card className="overflow-hidden border-2">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        Transaction Amount
                      </p>
                      <p
                        className="text-5xl font-bold"
                        style={{
                          color:
                            transaction.type === "EXPENSE"
                              ? "#ef4444"
                              : "#22c55e",
                        }}
                      >
                        {transaction.type === "EXPENSE" ? "-" : "+"}Rs{" "}
                        {transaction.amount.toFixed(2)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-sm px-3 py-1 ${
                          transaction.type === "EXPENSE"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {transaction.type}
                      </Badge>
                    </div>

                    {/* Pie Chart */}
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={0}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number | undefined) =>
                              value !== undefined
                                ? `Rs ${value.toFixed(2)}`
                                : "Rs 0.00"
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Date
                      </p>
                      <p className="text-lg font-semibold">
                        {format(new Date(transaction.date), "PPP")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Category */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-950">
                      <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Category
                      </p>
                      <Badge
                        className="text-white text-sm capitalize mt-1"
                        style={{
                          background: categoryColors[transaction.category],
                        }}
                      >
                        {transaction.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Account */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-50 dark:bg-green-950">
                      <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Account ID
                      </p>
                      <p className="text-sm font-mono">
                        {transaction.accountId.slice(0, 8)}...
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recurring Status */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-3 rounded-full bg-orange-50 dark:bg-orange-950">
                      {transaction.isReccuring ? (
                        <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Frequency
                      </p>
                      {transaction.isReccuring ? (
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className="gap-1 bg-green-100 text-green-700"
                          >
                            <RefreshCw className="h-3 w-3" />
                            {transaction.reccuringInterval &&
                              RECURRING_INTERVALS[
                                transaction.reccuringInterval
                              ]}
                          </Badge>
                          {transaction.nextReccuringDate && (
                            <p className="text-xs text-muted-foreground">
                              Next:{" "}
                              {format(
                                new Date(transaction.nextReccuringDate),
                                "PP",
                              )}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          One-time
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {transaction.description && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-900">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground font-medium mb-2">
                          Description
                        </p>
                        <p className="text-base leading-relaxed">
                          {transaction.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Metadata */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant="outline" className="mt-1">
                        {transaction.status || "COMPLETED"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium mt-1">
                        {format(new Date(transaction.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Transaction not found
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionDetailModal;
