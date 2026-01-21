"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AccountType } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { Account } from "@/types/account";
// id String @id @default(uuid())
// name String
// type AccountType
// balance Decimal @default(0)
// isDefault Boolean @default(false)
// userId String
// user User @relation(fields: [userId],references: [id],onDelete: Cascade)
// transactions Transaction[]
// createdAt DateTime @default(now())
// updatedAt DateTime @updatedAt
export interface CreateAccountData {
  name: string;
  type: AccountType;
  balance: string;
  isDefault: boolean;
}

const serializeTransaction = (obj: {
  balance?: { toNumber: () => number };
  [key: string]: unknown;
}): Account => {
  const serialized: Record<string, unknown> = { ...obj };
  if (
    obj.balance &&
    typeof obj.balance === "object" &&
    "toNumber" in obj.balance
  ) {
    serialized.balance = obj.balance.toNumber();
  }
  return serialized as Account;
};

export async function createAccount(data: CreateAccountData) {
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

    const balanceInFloat = parseFloat(data.balance);

    if (isNaN(balanceInFloat)) {
      throw new Error("Invalid balance Amount");
    }

    // check if it's user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account is set as default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create the account
    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: balanceInFloat,
        isDefault: shouldBeDefault,
        userId: user.id,
      },
    });

    const serializedAccount = serializeTransaction(account);

    // Tell, next js, browser, toremove teh cached stale data from the /dashboard page and show the latest data from the db
    revalidatePath("/dashboard");

    return { success: true, data: serializedAccount };
  } catch (error: unknown) {
    console.log("Error while creating account");
    throw new Error(
      error instanceof Error
        ? error.message
        : "An error occurred while creating account",
    );
  }
}

export async function getUserAccounts(): Promise<Account[]> {
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

  const accounts = await db.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });
  const serializedAccounts = accounts.map((account) =>
    serializeTransaction(account),
  );
  return serializedAccounts;
}
