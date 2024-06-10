import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from "@okta/okta-auth-js";
import { Security } from "@okta/okta-react";
import { oktaConfig } from "./config/oktaConfig";
import App from './App';
import { Provider } from "./context/context";

const oktaAuth = new OktaAuth(oktaConfig);

const AuthWrapper = () => {
    const navigate = useNavigate();
    const customAuthHandler = () => {
        navigate('/protected');
    };

    const restoreOriginalUri = async (_oktaAuth: any, originalUri: any) => {
        navigate(toRelativeUrl(originalUri || '/', window.location.origin));
    };

    return (
        <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri} onAuthRequired={customAuthHandler}>
            <Provider>
                <App />
            </Provider>
        </Security>
    );
};

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthWrapper />
        </BrowserRouter>
    </React.StrictMode>
);