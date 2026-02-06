import { getUserAccounts } from "@/actions/dashboard";
import AddTransactionForm from "./_components/transaction-form";
import { defaultCategories } from "@/data/categories";
import { getTransaction } from "@/actions/transaction";

type TransactionData = Awaited<ReturnType<typeof getTransaction>>;

const AddTransactionPage = async ({
  searchParams,
}: {
  searchParams: { edit?: string };
}) => {
  const accounts = await getUserAccounts();

  const editId = searchParams?.edit;

  let initialData: TransactionData | null = null;
  if (editId) {
    initialData = await getTransaction(editId);
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {editId ? "Update Transaction" : "Add Transaction"}
      </h1>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData as Record<string, unknown> | null}
      />
    </div>
  );
};

export default AddTransactionPage;
