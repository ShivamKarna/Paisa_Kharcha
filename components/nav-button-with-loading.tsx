"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { LoadingBar } from "./ui/loading-bar";

interface NavButtonWithLoadingProps {
  href: string;
  children: React.ReactNode;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  className?: string;
}

export const NavButtonWithLoading = ({
  href,
  children,
  variant = "default",
  className = "",
}: NavButtonWithLoadingProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reset loading state when navigation completes
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 0);
      return () => clearTimeout(timer);
    }
  }, [pathname, isNavigating]);

  const handleClick = () => {
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <>
      <LoadingBar loading={isNavigating} />
      <Button onClick={handleClick} variant={variant} className={className}>
        {children}
      </Button>
    </>
  );
};
