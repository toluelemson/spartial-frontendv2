import React from "react";
import { Routes, Route } from "react-router-dom";
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
import LimeAnalysis from "../customComponents/XAI/LimeAnalysis";
import ModelComparison from "../customComponents/models/ModelComparison";
import Fairness from "../customComponents/Services/Fairness/Fairness";
import EnhancedX from "../customComponents/Services/EnhancedX/EnhancedX";
import Privacy from "../customComponents/Services/Privacy/Privacy";
import MedicalHomepage from "../customComponents/medical/medicalHomepage";
import DetectMIEmergencies from "../customComponents/medical/DetectMIEmergencies";
import GenerateExplanations from "../customComponents/medical/GenerateExplanations";
import DemoMIEmergency from "../customComponents/medical/DemoMIEmergency";
import VisualizeECG from "../customComponents/medical/VisualizeECG";
import IdentifySegments from "../customComponents/medical/IdentifySegments";
import TickImportance from "../customComponents/medical/TickImportance";
import LeadImportance from "../customComponents/medical/LeadImportance";
import TimeImportance from "../customComponents/medical/TimeImportance";
import Spatial from "../customComponents/Spatial/Spatial";

interface RouteConfig {
  path: string;
  Component: React.ComponentType;
  isProtected?: boolean;
}

const routeConfig: RouteConfig[] = [
  { path: "/", Component: Dashboard },
  { path: "/build/ad", Component: ModelPage },
  { path: "/models/all", Component: AllModels },
  { path: "/build/ac", Component: BuildACModelForm },
  { path: "/login", Component: LoginWidget, isProtected: false },
  { path: "/login/callback", Component: LoginCallback, isProtected: false },
  { path: "/protected", Component: ProtectedComponent },
  { path: "/datasets/:type/:action", Component: DatasetList },
  { path: "/xai/lime/:modelId", Component: LimeAnalysis },
  { path: "/spatial/:modelId", Component: Spatial },
  { path: "/xai/lime", Component: LimeAnalysis },
  { path: "/xai/models/comparison", Component: ModelComparison },
  { path: "/xai/service/fairness", Component: Fairness },
  { path: "/xai/service/enhancedX", Component: EnhancedX },
  { path: "/xai/service/privacy", Component: Privacy },
  { path: "/medicalHomepage", Component: MedicalHomepage },
  { path: "/DetectMIEmergencies", Component: DetectMIEmergencies },
  { path: "/GenerateExplanations", Component: GenerateExplanations },
  { path: "/DemoMIEmergency", Component: DemoMIEmergency },
  { path: "/VisualizeECG", Component: VisualizeECG },
  { path: "/IdentifySegments", Component: IdentifySegments },
  { path: "/TickImportance", Component: TickImportance },
  { path: "/TimeImportance", Component: TimeImportance },
  { path: "/LeadImportance", Component: LeadImportance },
  { path: "*", Component: NoMatchComponent, isProtected: false },
];

const AppRoutes: React.FC = () => (
  <Routes>
    {routeConfig.map(({ path, Component, isProtected = true }) => (
      <Route
        key={path}
        path={path}
        element={
          isProtected ? (
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          ) : (
            <Component />
          )
        }
      />
    ))}
  </Routes>
);

export default AppRoutes;
