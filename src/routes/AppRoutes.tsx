import React from 'react';
import {Routes, Route} from 'react-router-dom';
import LoginWidget from "../components/Auth/LoginWidget";
import {LoginCallback} from "@okta/okta-react";
import ProtectedRoute from "../components/util/ProtectedRoute";
import ProtectedComponent from "../views/ProtectedComponent";
import ModelPage from "../pages/home/ModelPage";
import BuildACModelForm from "../components/Models/BuildModel/BuilldACModelForms";
import AllModels from "../components/Models/ModelList";
import DatasetList from "../components/Datasets/DatasetList";
import LimeAnalysis from "../components/XAI/LimeAnalysis";
import ModelComparison from "../components/Models/Comparison/ModelComparison";
import Fairness from "../components/Services/Fairness/Fairness";
import Privacy from "../components/Services/Privacy/Privacy";
import EnhancedX from "../components/Services/EnhancedX/EnhancedX";
import Spatial from "../components/Spatial/SpatialDashboard";
import MedicalHomepage from "../components/Services/medical/medicalHomepage";
import DetectMIEmergencies from "../components/Services/medical/DetectMIEmergencies";
import GenerateExplanations from "../components/Services/medical/GenerateExplanations";
import DemoMIEmergency from "../components/Services/medical/DemoMIEmergency";
import DemoMIEmergencyData from "../components/Services/medical/DemoMIEmergencyData";
import VisualizeECG from "../components/Services/medical/VisualizeECG";
import IdentifySegments from "../components/Services/medical/IdentifySegments";
import TickImportance from "../components/Services/medical/TickImportance";
import TimeImportance from "../components/Services/medical/TimeImportance";
import LeadImportance from "../components/Services/medical/LeadImportance";
import metricsHomepage from "../components/Services/Metrics/metricsHomepage";
import EvasionImpact from "../components/Services/Metrics/EvasionImpact";
import ConsistencyMetric from "../components/Services/Metrics/ConsistencyMetric";
interface RouteConfig {
    path: string;
    Component: React.ComponentType;
    isProtected?: boolean;
}

const routeConfig: RouteConfig[] = [{path: '/', Component: AllModels}, {
    path: '/build/ad',
    Component: ModelPage
}, {path: '/models/all', Component: AllModels}, {path: '/build/ac', Component: BuildACModelForm}, {
    path: '/login',
    Component: LoginWidget,
    isProtected: false
}, {path: '/login/callback', Component: LoginCallback, isProtected: false}, {
    path: '/protected',
    Component: ProtectedComponent
}, {path: '/datasets/:type/:action', Component: DatasetList}, {
    path: '/xai/lime/:modelId',
    Component: LimeAnalysis
}, {path: '/spatial/dashboard/:modelId', Component: Spatial}, {
    path: '/spatial/dashboard/',
    Component: Spatial
}, {path: '/xai/lime', Component: LimeAnalysis}, {
    path: '/xai/models/comparison',
    Component: ModelComparison
}, {path: '/xai/service/fairness', Component: Fairness}, {
    path: '/xai/service/enhancedX',
    Component: EnhancedX
}, {path: '/xai/service/privacy', Component: Privacy}, {
    path: "/medicalHomepage",
    Component: MedicalHomepage
}, {path: '/DetectMIEmergencies', Component: DetectMIEmergencies}, {
    path: '/GenerateExplanations',
    Component: GenerateExplanations
}, {path: '/DemoMIEmergency', Component: DemoMIEmergency}, {
    path: '/DemoMIEmergencyData',
    Component: DemoMIEmergencyData
}, {path: '/VisualizeECG', Component: VisualizeECG}, {
    path: '/IdentifySegments',
    Component: IdentifySegments
}, {path: '/TickImportance', Component: TickImportance}, {
    path: '/TimeImportance',
    Component: TimeImportance
}, {path: '/LeadImportance', Component: LeadImportance}, {
    path: '/Metrics/metricsHomepage',
    Component: metricsHomepage
}, {path: '/Metrics/EvasionImpact', Component: EvasionImpact}, {
    path: '/Metrics/ConsistencyMetric',
    Component: ConsistencyMetric
},
    // {path: '/XAI/XAIHomepage', Component: XAIHomepage}, {path: '*', Component: NoMatchComponent, isProtected: false}
];
const AppRoutes: React.FC = () => (
    <Routes>
        {routeConfig.map(({path, Component, isProtected = true}) => (
            <Route
                key={path}
                path={path}
                element={
                    isProtected ? (
                        <ProtectedRoute>
                            <Component/>
                        </ProtectedRoute>
                    ) : (
                        <Component/>
                    )
                }
            />
        ))}
    </Routes>
)
export default AppRoutes;

