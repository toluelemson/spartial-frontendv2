import React from 'react';
import { Link } from 'react-router-dom';

const NoMatchComponent = () => {
    return (
        <div className="container text-center mt-5">
            <h1 className="display-1">404</h1>
            <p className="fs-3">Page Not Found</p>
            <p className="lead">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn btn-primary">Go Back Home</Link>
        </div>
    );
};

export default NoMatchComponent;
