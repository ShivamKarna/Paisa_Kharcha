"use client";
import React, { useEffect, useState } from "react";
import { Account } from "@/types/account";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useRouter } from "next/navigation";
interface AccountCardProps {
  account: Account;
}

const AccountCard = ({ account }: AccountCardProps) => {
  const { name, type, balance, id, isDefault } = account;
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the switch
    if ((e.target as HTMLElement).closest('button[role="switch"]')) {
      return;
    }
    setIsNavigating(true);
    router.push(`/account/${id}`);
  };

  const handleDefaultChange = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDefault) {
      toast.warning("You need atleast 1 Default Account ");
      return; // do't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated SuccessFully");
    }
  }, [updatedAccount, updateDefaultLoading]);
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as Error).message
          : typeof error === "string"
            ? error
            : "Failed to update Default Account";
      toast.error(errorMessage);
    }
  }, [error]);

  return (
    <div>
      <LoadingBar loading={updateDefaultLoading || isNavigating} />
      <Card
        className="hover:shadow-md transition-shadow group relative cursor-pointer"
        onClick={handleCardClick}
      >
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase">
              {name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {updateDefaultLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              ${(balance as number).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground ">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center mr-4">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              Expense
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};
export default AccountCard;
