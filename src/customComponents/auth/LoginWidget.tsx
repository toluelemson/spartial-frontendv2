import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import OktaSignIn from '@okta/okta-signin-widget';
import { oktaConfig } from '../../config/oktaConfig';

const LoginWidget: React.FC = (): React.ReactElement | null => {
    const { oktaAuth, authState } = useOktaAuth();
    const navigate = useNavigate();
    const widgetRef = useRef(null);

    const onSuccess = async (accessTokens: any) => {
        console.log(accessTokens)
        await oktaAuth.handleLoginRedirect(accessTokens);
    };

    React.useEffect(() => {
        const widget = new OktaSignIn(oktaConfig);
        widget.showSignInToGetTokens({
            el: widgetRef.current as any,
        }).then(onSuccess).catch((e) => { console.log(e) });

        return () => widget.remove();
    }, [onSuccess]);

    React.useEffect(() => {
        if (authState?.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [authState?.isAuthenticated, navigate]);

    if (authState?.isPending) {
        return <div>Loading...</div>;
    }

    return (

        <div ref={widgetRef}></div>
    );
};

export default LoginWidget;
