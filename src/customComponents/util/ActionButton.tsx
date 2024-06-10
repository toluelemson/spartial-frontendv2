import React, {FC} from "react";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {Placement} from "react-bootstrap/types";


export interface ActionButtonProps {
    onClick: () => void;
    tooltip: string;
    id: string;
    children?: React.ReactNode;
    placement?: Placement;

    icon?: React.ReactNode,

    buttonText?: string,

    targetPath?: string
}
const ActionButton: FC<ActionButtonProps> = ({ onClick, tooltip, id, placement, children, icon, buttonText , targetPath}) =>
{

    return (
        <>
            {buttonText ? (
                <OverlayTrigger trigger="focus" placement={placement} overlay={<Tooltip id={id} >{tooltip}</Tooltip>}>
                    <button className="btn d-inline-flex align-items-center justify-content-center btn-outline-primary btn-sm  px-3 p-1 m-1" onClick={onClick}>
                        {icon}
                        <span className="ms-2">{buttonText}</span>
                    </button>
                </OverlayTrigger>
                ) : (
                    <OverlayTrigger trigger="focus" placement={placement} overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
                        <button className="btn btn-link p-1" onClick={onClick}>
                            {children}
                        </button>
                    </OverlayTrigger>
                )
            }
        </>
    )}


export default ActionButton