import React from 'react';
import Menu from "././Sidebar/Sidebar";
import AppRoutes from "../routes/AppRoutes";
import {Footer} from "./Footer";

const Layout = () => {
        return (
            <div className="container-fluid">
                <div className="row " >
                    <div className="col-2 bg-dark">
                        <Menu />
                    </div>
                    <div className="col-10">
                        <AppRoutes />
                        <Footer />
                    </div>

                </div>

            </div>
        );
    };

export default Layout