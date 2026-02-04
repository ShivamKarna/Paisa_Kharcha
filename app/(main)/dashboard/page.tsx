import React, { Suspense } from "react";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import AccountCard from "./_components/account-card";
import { Account } from "@/types/account";
import { getCurrentBudget } from "@/actions/budget";
import { BudgetProgress } from "./_components/budget-progress";
import DashBoardOverview from "./_components/transaction-overview";

const DashboardPage = async () => {
  const account = await getUserAccounts();

  const defaultAccount = account.find((acc) => acc.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget();
  }
  const transactions = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Budget Progess */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Dashboard OVerview */}
      <Suspense fallback={"Loading Overview"}>
        <DashBoardOverview
          accounts={account}
          transactions={transactions || []}
        />
      </Suspense>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add new Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {account.length > 0 &&
          account?.map((acc: Account) => {
            return <AccountCard key={acc.id} account={acc} />;
          })}
      </div>
    </div>
  );
};

export default DashboardPage;
