import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginWidget from "../customComponents/auth/LoginWidget";
import { LoginCallback } from "@okta/okta-react";
import ProtectedRoute from "../customComponents/util/ProtectedRoute";
import ProtectedComponent from "../views/ProtectedComponent";
import ModelPage from "../pages/home/ModelPage";
import Dashboard from "../pages/home/Dashboard";
import BuildACModelForm from "../customComponents/models/BuilldACModelForms";
import NoMatchComponent from "../customComponents/NoMatchComponent";
import AllModels from "../customComponents/models/ModelList";
import DatasetList from "../customComponents/datasets/DatasetList";

interface RouteConfig {
    path: string;
    Component: React.ComponentType;
    isProtected?: boolean;
}

const routeConfig : RouteConfig[] = [
    { path: '/', Component: Dashboard },
    { path: '/build/ad', Component: ModelPage },
    { path: '/models/all', Component: AllModels },
    { path: '/build/ac', Component: BuildACModelForm },
    { path: '/login', Component: LoginWidget, isProtected: false },
    { path: '/login/callback', Component: LoginCallback, isProtected: false },
    { path: '/protected', Component: ProtectedComponent },
    { path: '/datasets/:type/:action', Component: DatasetList },
    { path: '*', Component: NoMatchComponent, isProtected: false }
];

const AppRoutes: React.FC = () => (
    <Routes>
        {routeConfig.map(({ path, Component, isProtected = true }) => (
            <Route
                key={path}
                path={path}
                element={
                    isProtected ?
                        <ProtectedRoute>
                            <Component />
                        </ProtectedRoute>
                        : <Component />
                }
            />
        ))}
    </Routes>
);

export default AppRoutes;
