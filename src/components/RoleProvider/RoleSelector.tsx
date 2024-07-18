import React, {useEffect} from "react";
import {useRoleContext, Role} from "./RoleContext"; // Import Role type

const roleNames: { [key in Role]: string } = {
    // user: "User",
    developer: "Developer",
    auditor: "Auditor",
    medicalExpert: "Medical Expert",
    business: "Business",
    endUser: "End User",
};

const RoleSelector: React.FC = () => {
    const {roles, userRole, setUserRole} = useRoleContext();

    useEffect(() => {
        if (roles.length > 0 && !roles.includes(userRole)) {
            setUserRole(roles[0]); // Set default role if current role is not in the new roles list
        }
    }, [roles, userRole, setUserRole]);

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUserRole(event.target.value as Role);
    };

    return (
        <div className="mb-3">
            <label htmlFor="userRoleSelector" className="form-label">
                <h5>User Role:</h5>
            </label>
            <select
                id="userRoleSelector"
                className="form-select"
                value={userRole}
                onChange={handleRoleChange}
            >
                {roles.map((role) => (
                    <option key={role} value={role}>
                        {roleNames[role]}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RoleSelector;
