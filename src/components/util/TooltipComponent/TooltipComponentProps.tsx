import React, { ReactNode } from 'react';
import { Tooltip, OverlayTrigger, OverlayTriggerProps } from 'react-bootstrap';

interface TooltipComponentProps {
    message: string;
    children: ReactNode;
}

const TooltipComponent: React.FC<TooltipComponentProps> = ({ message, children }) => {
    return (
        <OverlayTrigger
            overlay={<Tooltip id={`tooltip-${Math.random()}`}>{message}</Tooltip>}
            placement="top"
        >
            {({ ref, ...props }) => React.cloneElement(children as React.ReactElement<any>, { ...props, ref })}
        </OverlayTrigger>
    );
};

export default TooltipComponent;
