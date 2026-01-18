import Header from "@/components/header";
import React from "react";
import { ChildrenType } from "../(auth)/layout";

const MainLayout = ({ children }: ChildrenType) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default MainLayout;
