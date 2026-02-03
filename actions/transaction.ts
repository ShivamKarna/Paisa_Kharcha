"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  TransactionType,
  ReccuringInterval,
  TransactionStatus,
} from "@/lib/generated/prisma/enums";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateNextRecurringDate } from "@/lib/utils";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Gemini Api Key not provided");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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

    // get req data for arcjet
    const req = await request();

    // check rate limit
    const decisoin = await aj.protect(req, {
      userId,
      requested: 1, // specify how many tokens to consume
    });

    if (decisoin.isDenied()) {
      if (decisoin.reason.isRateLimit()) {
        const { remaining, reset } = decisoin.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many Requests. Please Try again Later !");
      }

      throw new Error("Request Blocked");
    }

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

export async function scanReciept(file: File) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();

    // convert arrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = ``;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}
