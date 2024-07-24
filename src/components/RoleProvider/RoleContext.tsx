import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role =
  // | "user"
  "business" | "developer" | "auditor" | "medicalExpert" | "endUser";

interface RoleContextProps {
  roles: Role[];
  currentService: string;
  setCurrentService: (service: string) => void;
  userRole: Role;
  setUserRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentService, setCurrentService] = useState<string>("XAI");
  const [userRole, setUserRole] = useState<Role>("endUser");

  const rolesForServices: { [key: string]: Role[] } = {
    XAI: ["endUser", "business", "developer", "auditor"],
    Medical: ["endUser", "medicalExpert", "developer"],
    Network: ["endUser"],
    Fairness: ["endUser", "developer"],
    WithSecure: ["endUser", "developer"],
  };

  const currentRoles = rolesForServices[currentService] || [];

  return (
    <RoleContext.Provider
      value={{
        roles: currentRoles,
        currentService,
        setCurrentService,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = (): RoleContextProps => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return context;
};
