import React from "react";
import Menu from "././Sidebar/Sidebar";
import AppRoutes from "../routes/AppRoutes";
import { Footer } from "./Footer";
import { RoleProvider } from "../customComponents/RoleProvider/RoleContext";

const Layout = () => {
  return (
    <RoleProvider>
      <div className="container-fluid">
        <div className="row ">
          <div className="col-2 bg-dark">
            <Menu />
          </div>
          <div className="col-10">
            <AppRoutes />
            <Footer />
          </div>
        </div>
      </div>
    </RoleProvider>
  );
};

export default Layout;
