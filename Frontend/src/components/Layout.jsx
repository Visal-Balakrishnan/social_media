import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main className="mt-16">{children}</main> {/* Push content below header */}
    </div>
  );
};

export default Layout;
