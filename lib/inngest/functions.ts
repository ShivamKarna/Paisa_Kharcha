import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alert", name: "Check Budget Alert" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });
    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        );

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id, // Only consider default account
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });
        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount =
          typeof budget.amount === "number"
            ? budget.amount
            : Number(budget.amount);
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        // console.log(`Budget ${budget.id} check:`, {
        //   totalExpenses,
        //   budgetAmount,
        //   percentageUsed,
        //   lastAlertSent: budget.lastAlertSent,
        //   shouldSendAlert: percentageUsed >= 80,
        //   isNewMonthCheck: budget.lastAlertSent
        //     ? isNewMonth(new Date(budget.lastAlertSent), new Date())
        //     : true,
        // });

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // console.log(`Sending budget alert email to ${budget.user.email}`);
          // Send email
          const emailResult = await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name || budget.user.email,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount,
                totalExpenses,
              },
            }),
          });

          if (emailResult.success) {
            // console.log(
            //   `Email sent successfully to ${budget.user.email}`,
            //   emailResult.data,
            // );
            // Update lastAlertSent in db
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
          } else {
            // console.error(
            //   `Failed to send email to ${budget.user.email}:`,
            //   emailResult.error,
            // );
          }
        }
      });
    }
  },
);

function isNewMonth(lastAlertSent: Date, currentDate: Date) {
  return (
    lastAlertSent.getMonth() !== currentDate.getMonth() ||
    lastAlertSent.getFullYear() !== currentDate.getFullYear()
  );
}
