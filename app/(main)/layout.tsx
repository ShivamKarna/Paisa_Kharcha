import React from "react";
import { ChildrenType } from "../(auth)/layout";

const MainLayout = ({ children }: ChildrenType) => {
  return <div className="container mx-auto my-8 sm:my-32 px-2 sm:px-4 max-w-full overflow-x-hidden">{children}</div>;
};

export default MainLayout;
