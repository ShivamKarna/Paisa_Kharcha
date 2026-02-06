"use client";
import {
  createTransaction,
  updateTransaction,
  CreateTransactionData,
} from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { ReceiptScanner } from "./reciept-scanner";
import { Account } from "@/types/account";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { toast } from "sonner";
import { LoadingBar } from "@/components/ui/loading-bar";

type TransactionFormData = z.infer<typeof transactionSchema>;

interface ScannedReceiptData {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  merchantName?: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  subcategories?: string[];
}

interface AddTransactionFormProps {
  accounts: Account[];
  categories: Category[];
  editMode?: boolean;
  initialData?: Record<string, unknown> | null;
}

const AddTransactionForm = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}: AddTransactionFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editid = searchParams.get("edit");
  // Derive edit mode from editid presence
  const isEditMode = !!editid || editMode;
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      isEditMode && initialData
        ? {
            type: (initialData.type as "INCOME" | "EXPENSE") || "EXPENSE",
            amount: String(initialData.amount || ""),
            description: String(initialData.description || ""),
            accountId: String(initialData.accountId || ""),
            category: String(initialData.category || ""),
            date: new Date(initialData.date as Date),
            isRecurring: Boolean(initialData.isReccuring),
            recurringInterval: initialData.reccuringInterval
              ? (initialData.reccuringInterval as
                  | "DAILY"
                  | "WEEKLY"
                  | "MONTHLY"
                  | "YEARLY")
              : undefined,
          }
        : {
            type: "EXPENSE" as const,
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(
    isEditMode
      ? (data: CreateTransactionData) => updateTransaction(editid!, data)
      : createTransaction,
  );

  const type = watch("type");
  const isReccuring = watch("isRecurring");
  const date = watch("date");

  const onSubmit = async (data: TransactionFormData) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    transactionFn(formData);
  };
  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        isEditMode
          ? "Transaction updated Successfully"
          : "Transaction created Successfully",
      );
      reset();
      if (transactionResult.data && "accountId" in transactionResult.data) {
        router.push(`/account/${transactionResult.data.accountId}`);
      }
    }
  }, [transactionResult, transactionLoading, reset, router, isEditMode]);

  const filteredCategories = categories.filter(
    (category) => category.type === type,
  );

  const handleScanComplete = (scannedData: ScannedReceiptData | null) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  return (
    <>
      <LoadingBar loading={transactionLoading} />
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* AI reciept scanner */}
        {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <Select
            onValueChange={(value) =>
              setValue("type", value as "INCOME" | "EXPENSE")
            }
            defaultValue={type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {errors.type && (
            <p className="text-sm text-red-600">
              {String(errors.type.message)}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">
                {String(errors.amount.message)}
              </p>
            )}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Account</label>
            <Select
              onValueChange={(value) => setValue("accountId", value)}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} (${Number(account.balance).toFixed(2)})
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button
                    variant={"ghost"}
                    className="w-full select-none items-center text-md outline-none"
                  >
                    Create Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>

            {errors.accountId && (
              <p className="text-sm text-red-600">
                {String(errors.accountId.message)}
              </p>
            )}
          </div>
        </div>

        {/* category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            onValueChange={(value) => setValue("category", value)}
            defaultValue={getValues("category")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.category && (
            <p className="text-sm text-red-600">
              {String(errors.category.message)}
            </p>
          )}
        </div>

        {/* date */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full pl-3 text-left font-normal"
              >
                {date ? format(date, "PPP") : <span>Pick a Date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity=50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setValue("date", date)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {errors.date && (
            <p className="text-sm text-red-600">
              {String(errors.date.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="">Description</label>
          <Input placeholder="Enter Description" {...register("description")} />
          {errors.description && (
            <p className="text-sm text-red-600">
              {String(errors.description.message)}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <label
              htmlFor="balance"
              className="text-sm font-medium cursor-pointer"
            >
              Set as Default
            </label>
            <p className="text-sm text-muted-foreground">
              This account will be selected by default for transactions
            </p>
          </div>
          <Switch
            checked={isReccuring}
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
          />
        </div>
        {isReccuring && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recurring Interval</label>
            <Select
              onValueChange={(value) =>
                setValue(
                  "recurringInterval",
                  value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
                )
              }
              defaultValue={getValues("recurringInterval")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY"> Monthly</SelectItem>
                <SelectItem value="YEARLY"> Yearly</SelectItem>
              </SelectContent>
            </Select>

            {errors.recurringInterval && (
              <p className="text-sm text-red-600">
                {String(errors.recurringInterval.message)}
              </p>
            )}
          </div>
        )}

        {/* Butons for cancel and create transaction */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 ease-in-out"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:hover:shadow-none"
            disabled={transactionLoading}
          >
            {transactionLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                {isEditMode
                  ? "Updating Transaction..."
                  : "Creating Transaction..."}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                {isEditMode ? "Update Transaction" : "Create Transaction"}
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddTransactionForm;
