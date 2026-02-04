import { SignUp } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div>
      <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </div>
  );
};

export default Page;
