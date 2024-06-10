import React, { useEffect } from "react";
import { useRoleContext } from "../../RoleProvider/RoleContext";
import MedicalNavbar from "./medicalNavbar";

const MedicalHomepage: React.FC = () => {
  const { setCurrentService } = useRoleContext();

  useEffect(() => {
    setCurrentService("Medical");
  }, [setCurrentService]);

  return (
    <div>
      <MedicalNavbar />
    </div>
  );
};
export default MedicalHomepage;
