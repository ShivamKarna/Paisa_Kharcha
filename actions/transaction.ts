import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  TransactionType,
  ReccuringInterval,
  TransactionStatus,
} from "@/lib/generated/prisma/enums";

interface TransactionWithAmount {
  amount: { toNumber: () => number };
  [key: string]: unknown;
}

interface CreateTransactionData {
  accountId: string;
  type: TransactionType;
  amount: number;
  date: Date;
  category: string;
  description?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: ReccuringInterval;
  status?: TransactionStatus;
  [key: string]: unknown;
}

const serializeAmount = (obj: TransactionWithAmount) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});
export async function createTransaction(data: CreateTransactionData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const balanceChange =
      data.type === TransactionType.EXPENSE ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: data.amount,
          accountId: data.accountId,
          description: data.description,
          date: data.date,
          category: data.category,
          receiptUrl: data.receiptUrl,
          isReccuring: data.isRecurring,
          reccuringInterval: data.recurringInterval,
          status: data.status,
          userId: user.id,
          nextReccuringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An error occurred",
    );
  }
}
// helper func
function calculateNextRecurringDate(
  startDate: Date,
  interval: ReccuringInterval,
) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
