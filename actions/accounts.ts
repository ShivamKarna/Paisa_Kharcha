"use server";
import { db } from "@/lib/prisma";
import { Account } from "@/types/account";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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
    return { success: true, data: serializeTransaction(account) };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: errorMessage };
  }
}
