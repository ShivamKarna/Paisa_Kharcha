"use server";
import { db } from "@/lib/prisma";
import { Account } from "@/types/account";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeDecimal = <T extends Record<string, unknown>>(obj: T): T => {
  const serialized = { ...obj };
  for (const key in serialized) {
    const value = serialized[key];
    if (value && typeof value === "object" && "toNumber" in value) {
      (serialized as Record<string, unknown>)[key] = (
        value as { toNumber: () => number }
      ).toNumber();
    }
  }
  return serialized;
};

const serializeAccount = (obj: Record<string, unknown>): Account => {
  return serializeDecimal(obj) as unknown as Account;
};

export async function updateDefaultAccount(accountId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not Found");
    }

    // First, set all accounts to not default
    await db.account.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    // Then set the selected account as default
    const account = await db.account.update({
      where: { id: accountId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeAccount(account) };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function getAccountWithTransactions(accountId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not Found");
  }
  const account = await db.account.findUnique({
    where: { id: accountId },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account || account.userId !== user.id) return null;

  const serializedAccount = serializeAccount(account);
  const serializedTransactions = account.transactions.map((t) =>
    serializeDecimal(t),
  );

  return {
    ...serializedAccount,
    transactions: serializedTransactions,
  };
}

export async function getAccountWithTransactionsPaginated(
  accountId: string,
  page: number = 1,
  pageSize: number = 10,
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not Found");
  }

  const account = await db.account.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
      isDefault: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account || account.userId !== user.id) return null;

  const skip = (page - 1) * pageSize;
  const [transactions, totalCount] = await Promise.all([
    db.transaction.findMany({
      where: { accountId },
      orderBy: { date: "desc" },
      skip,
      take: pageSize,
    }),
    db.transaction.count({
      where: { accountId },
    }),
  ]);

  const serializedAccount = serializeAccount(account);
  const serializedTransactions = transactions.map((t) =>
    serializeDecimal(t),
  );

  return {
    ...serializedAccount,
    transactions: serializedTransactions,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}


const toNumber = (val: unknown): number => {
  if (val != null && typeof val === "object" && "toNumber" in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
};

export async function bulkDeleteTransactions(transactionIds: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get transactions to calculate balance changes
    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    // Group transactions by account to update balances
    const accountBalanceChanges = transactions.reduce<Record<string, number>>(
      (acc, transaction) => {
        const amount = toNumber(transaction.amount);
        const change =
          transaction.type === "EXPENSE" ? amount : -amount;
        acc[transaction.accountId] = (acc[transaction.accountId] ?? 0) + change;
        return acc;
      },
      {}
    );

    // Delete transactions and update account balances in a transaction
    await db.$transaction(async (tx) => {
      // Delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });
      // Update account balances
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: balanceChange },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}


