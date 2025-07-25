import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const menus = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Installations", path: "/installations" },
    { name: "Customers", path: "/customers" },
    { name: "Maintainance", path: "/maintainance" },
  ];
  return (
    <div className="w-64 h-full bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">SolarFlow</h2>
      <ul>
        {menus.map((menu) => (
          <li key={menu.path}>
            <Link
              to={menu.path}
              className={`block p-2 rounded hover:bg-yellow-100 ${
                location.pathname === menu.path
                  ? "bg-yellow-200 font-semibold"
                  : ""
              }`}
            >
              {menu.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
