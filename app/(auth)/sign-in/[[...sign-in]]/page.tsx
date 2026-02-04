import { SignIn } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <div>
      <SignIn 
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
};

export default Page;
