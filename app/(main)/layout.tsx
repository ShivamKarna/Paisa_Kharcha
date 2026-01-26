import React from "react";
import { ChildrenType } from "../(auth)/layout";

const MainLayout = ({ children }: ChildrenType) => {
  return <div className="container mx-auto pt-20 sm:pt-24 pb-8 sm:pb-32 px-2 sm:px-4 max-w-full overflow-x-hidden">{children}</div>;
};

export default MainLayout;
