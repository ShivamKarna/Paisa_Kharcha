import React from "react";
import { ChildrenType } from "../(auth)/layout";

const MainLayout = ({ children }: ChildrenType) => {
  return <div className="container mx-auto my-32">{children}</div>;
};

export default MainLayout;
