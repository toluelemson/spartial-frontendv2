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
import ModelComparison from "../customComponents/models/modelComparison/ModelComparison";
import Fairness from "../customComponents/Services/Fairness/Fairness";
import Privacy from "../customComponents/Services/Privacy/Privacy";
import MedicalHomepage from "../customComponents/Services/medical/medicalHomepage";
import DetectMIEmergencies from "../customComponents/Services/medical/DetectMIEmergencies";
import GenerateExplanations from "../customComponents/Services/medical/GenerateExplanations";
import DemoMIEmergency from "../customComponents/Services/medical/DemoMIEmergency";
import DemoMIEmergencyData from "../customComponents/Services/medical/DemoMIEmergencyData";
import VisualizeECG from "../customComponents/Services/medical/VisualizeECG";
import IdentifySegments from "../customComponents/Services/medical/IdentifySegments";
import TickImportance from "../customComponents/Services/medical/TickImportance";
import LeadImportance from "../customComponents/Services/medical/LeadImportance";
import TimeImportance from "../customComponents/Services/medical/TimeImportance";
// import Spatial from "../customComponents/Spatial/Spatial";
import metricsHomepage from "../customComponents/Services/Metrics/metricsHomepage";
import EvasionImpact from "../customComponents/Services/Metrics/EvasionImpact";
import ConsistencyMetric from "../customComponents/Services/Metrics/ConsistencyMetric";
import XAIHomepage from "../customComponents/Services/XAIS/XAIHomepage";
import EnhancedX from "../customComponents/Services/EnhancedX/EnhancedX";
import Spatial from "../customComponents/Spatial/SpatialDashboard";

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
  { path: "/spatial/dashboard/:modelId", Component: Spatial },
  { path: "/spatial/dashboard/", Component: Spatial },
  { path: "/xai/lime", Component: LimeAnalysis },
  { path: "/xai/models/comparison", Component: ModelComparison },
  { path: "/xai/service/fairness", Component: Fairness },
  { path: "/xai/service/enhancedX", Component: EnhancedX },
  { path: "/xai/service/privacy", Component: Privacy },
  { path: "/medicalHomepage", Component: MedicalHomepage },
  { path: "/DetectMIEmergencies", Component: DetectMIEmergencies },
  { path: "/GenerateExplanations", Component: GenerateExplanations },
  { path: "/DemoMIEmergency", Component: DemoMIEmergency },
  { path: "/DemoMIEmergencyData", Component: DemoMIEmergencyData },
  { path: "/VisualizeECG", Component: VisualizeECG },
  { path: "/IdentifySegments", Component: IdentifySegments },
  { path: "/TickImportance", Component: TickImportance },
  { path: "/TimeImportance", Component: TimeImportance },
  { path: "/LeadImportance", Component: LeadImportance },
  { path: "/Metrics/metricsHomepage", Component: metricsHomepage },
  { path: "/Metrics/EvasionImpact", Component: EvasionImpact },
  { path: "/Metrics/ConsistencyMetric", Component: ConsistencyMetric },
  { path: "/XAI/XAIHomepage", Component: XAIHomepage },
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
