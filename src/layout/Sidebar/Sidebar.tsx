import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";
import "./MenuStyles.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useMenuData } from "./MenuItem";
import RoleSelector from "../../components/RoleProvider/RoleSelector";

type MenuItemType = {
  id: number;
  path: string;
  title: string;
  icon: string;
  subItems?: MenuItemType[];
};

const Sidebar: React.FC = () => {
  const [openSubmenus, setOpenSubmenus] = useState<Set<number>>(new Set());
  const { authState, oktaAuth } = useOktaAuth();
  const menuItems: any[] = useMenuData();

  if (!authState) return <div>Loading...</div>;

  const toggleSubmenu = (id: number) => {
    setOpenSubmenus((prevOpenSubmenus) => {
      const newOpenSubmenus = new Set(prevOpenSubmenus);
      if (newOpenSubmenus.has(id)) {
        newOpenSubmenus.delete(id);
      } else {
        newOpenSubmenus.add(id);
      }
      return newOpenSubmenus;
    });
  };

  const handleLogout = async () => {
    await oktaAuth.signOut();
  };

  const MenuItem = ({ item }: { item: MenuItemType }) => (
    <li
      key={item.id}
      className="nav-item text-white my-1 justify-content-start"
    >
      <Link
        to={(item.subItems?.length ?? 0) > 0 ? "#" : item.path}
        className="nav-link text-white fs-5 d-flex justify-content-start"
        onClick={() =>
          (item.subItems?.length ?? 0) > 0 && toggleSubmenu(item.id)
        }
      >
        <i className={item.icon} style={{ minWidth: "1.5em" }}></i>
        <span className="ms-3 d-none d-lg-inline">{item.title}</span>
      </Link>
      {(item.subItems?.length ?? 0) > 0 && (
        <ul className={`submenu ${openSubmenus.has(item.id) ? "show" : ""}`}>
          {item.subItems?.map((subItem) => (
            <li
              key={subItem.id}
              className="nav-subitem text-white my-1 justify-content-start"
            >
              <Link
                to={subItem.path}
                className="nav-link text-white fs-5 d-flex align-items-center justify-content-start"
              >
                <i className={subItem.icon} style={{ minWidth: "1.5em" }}></i>
                <span className="ms-3 d-none d-lg-inline">{subItem.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="container">
      <div className="row">
        <div className="bg-dark col min-vh-100 d-flex flex-column">
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
                alt="Spatial Logo"
              />
            </Link>

            <Link
              to="/"
              className="text-decoration-none text-white ms-3 mt-3 d-block d-md-none"
            >
              <img
                src="/Logo.png"
                className="img-fluid"
                alt="Compact Logo"
                style={{ maxWidth: "129px", maxHeight: "39.5px" }}
              />
            </Link>
            <hr className="text-secondary" />

            <ul className="nav nav-pills flex-column mt-3">
              {authState.isAuthenticated ? <RoleSelector /> : ""}
              {menuItems
                ?.filter((item) => authState.isAuthenticated || !item.secure)
                .map((item) => (
                  <MenuItem item={item} key={item.id} />
                ))}
              {authState.isAuthenticated ? (
                <li className="nav-item my-1">
                  <button
                    onClick={handleLogout}
                    className="nav-link text-white fs-5 d-flex align-items-center justify-content-start"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span className="ms-3 d-none d-lg-inline">Logout</span>
                  </button>
                </li>
              ) : (
                <li className="nav-item my-1">
                  <Link
                    to="/login"
                    className="nav-link text-white fs-5 d-flex align-items-center justify-content-start"
                  >
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span className="ms-3 d-none d-lg-inline">Login</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
