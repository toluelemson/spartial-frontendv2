import React from 'react';
import LoginWidget from "../../customComponents/auth/LoginWidget";

export const Home: React.FC = () => {

    return (
        <div>
            <div className="container">
                <LoginWidget />
            </div>
        </div>
    );
}