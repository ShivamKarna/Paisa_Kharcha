import React from "react";

export type ChildrenType = {
  children: React.ReactNode;
};

const Layout = ({ children }: ChildrenType) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {children}
    </div>
  );
};

export default Layout;
