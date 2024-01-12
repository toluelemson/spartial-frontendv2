import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";
import { useMenuData } from "./MenuItem"; // Ensure this hook is defined and exports menu data
import "./MenuStyles.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type MenuItemType = {
  id: number;
  path: string;
  title: string;
  icon: string;
  subItems?: MenuItemType[];
};

const Sidebar: React.FC = () => {
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const { authState, oktaAuth } = useOktaAuth();
  const menuItems = useMenuData(); // Ensure this returns the correct menu data structure

  if (!authState) return <div>Loading...</div>;

  const toggleSubmenu = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: number
  ) => {
    event.preventDefault();
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  const handleLogout = async () => {
    await oktaAuth.signOut();
  };

  const MenuItem = ({ item }: { item: MenuItemType }) => (
    <li key={item.id} className="nav-item text-white my-1">
      <Link
        to={(item.subItems?.length ?? 0) > 0 ? "#" : item.path}
        className="nav-link text-white fs-5"
        onClick={(e) =>
          (item.subItems?.length ?? 0) > 0 && toggleSubmenu(e, item.id)
        }
      >
        <i className={item.icon}></i>
        <span className="ms-3 d-none d-lg-inline">{item.title}</span>
      </Link>
      {(item.subItems?.length ?? 0) > 0 && (
        <ul className={`submenu ${openSubmenu === item.id ? "show" : ""}`}>
          {item.subItems?.map((subItem) => (
            <li
              key={subItem.id}
              className="nav-subitem text-white my-1 d-flex justify-content-start"
            >
              <Link
                to={subItem.path}
                className="nav-link text-white fs-5 align-items-center"
              >
                <i className={subItem.icon}></i>
                <span className="ms-3 d-none d-lg-inline">{subItem.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="bg-dark col min-vh-100 d-flex flex-column">
          {" "}
          {/* Removed justify-content-between */}
          <div className="p-3 text-white bg-dark">
            {/* Logo Links */}
            <Link
              to="/"
              className="text-decoration-none text-white ms-3 mt-3 d-none d-lg-block"
            >
              <img
                src="/Spatial_Logo.png"
                width="129"
                height="39.5"
                className="d-block"
                alt="Logo"
              />{" "}
              {/* Changed to d-block */}
            </Link>

            <Link
              to="/"
              className="text-decoration-none text-white ms-3 mt-3 d-block d-md-none"
            >
              <img
                src="/Logo.png"
                className="img-fluid"
                alt="Logo"
                style={{
                  maxWidth: "129px",
                  maxHeight: "39.5px",
                }}
              />{" "}
              {/* Removed d-inline-block align-center */}
            </Link>
            <hr className="text-secondary" />
            <ul className="nav nav-pills flex-column mt-3 text-start">
              {" "}
              {/* text-start will align text to the left */}
              {menuItems
                .filter((item) => authState.isAuthenticated || !item.secure)
                .map((item) => (
                  <MenuItem item={item} key={item.id} />
                ))}
              <li className="nav-item my-1">
                {authState.isAuthenticated ? (
                  <Link
                    to="#"
                    onClick={handleLogout}
                    className="nav-link text-white fs-5"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span className="ms-3 d-none d-lg-inline">Logout</span>
                  </Link>
                ) : (
                  <Link to="/login" className="nav-link text-white fs-5">
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span className="ms-3 d-none d-lg-inline">Login</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
