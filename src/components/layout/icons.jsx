function Icon({ children, size = 18, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", ...style }}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---- Generic UI icons ---- */

export function Chevron({ size = 13, style = {}, className = "" }) {
  return <i className={`fa-solid fa-chevron-down ${className}`} style={{ fontSize: size, ...style }} />;
}

export function SearchIcon({ size = 14, style = {}, className = "" }) {
  return <i className={`fa-solid fa-magnifying-glass ${className}`} style={{ fontSize: size, ...style }} />;
}

export function ChevronsLeft({ size = 14, style = {}, className = "" }) {
  return <i className={`fa-solid fa-angles-left ${className}`} style={{ fontSize: size, ...style }} />;
}

export function ChevronsRight({ size = 14, style = {}, className = "" }) {
  return <i className={`fa-solid fa-angles-right ${className}`} style={{ fontSize: size, ...style }} />;
}

export function MoreIcon({ size = 14, style = {}, className = "" }) {
  return <i className={`fa-solid fa-ellipsis-vertical ${className}`} style={{ fontSize: size, ...style }} />;
}

/* ---- Navigation group icons ---- */

function DashboardIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-chart-pie" style={{ fontSize: size, ...style }} />;
}

function WarehouseIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-warehouse" style={{ fontSize: size, ...style }} />;
}

function AttendanceIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-clipboard-user" style={{ fontSize: size, ...style }} />;
}

function WeighmentIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-scale-balanced" style={{ fontSize: size, ...style }} />;
}

function InventoryIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-boxes-stacked" style={{ fontSize: size, ...style }} />;
}

function PurchaseIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-cart-shopping" style={{ fontSize: size, ...style }} />;
}

function SalesIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: size, ...style }} />;
}

function EmployeesIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-users" style={{ fontSize: size, ...style }} />;
}

function ReportsIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-chart-column" style={{ fontSize: size, ...style }} />;
}

function AlertsIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: size, ...style }} />;
}

function SettingsIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-sliders" style={{ fontSize: size, ...style }} />;
}

function UsersIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-user-group" style={{ fontSize: size, ...style }} />;
}

function BiomassIcon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-wheat-awn" style={{ fontSize: size, ...style }} />;
}

function Stage1Icon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-tractor" style={{ fontSize: size, ...style }} />;
}

function Stage2Icon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-gears" style={{ fontSize: size, ...style }} />;
}

function Stage3Icon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-cubes-stacked" style={{ fontSize: size, ...style }} />;
}

function Stage4Icon({ size = 17, style = {} }) {
  return <i className="fa-solid fa-truck-ramp-box" style={{ fontSize: size, ...style }} />;
}

export const NAV_ICONS = {
  "/": DashboardIcon,
  "/warehouses": WarehouseIcon,
  "/users": UsersIcon,
  "/attendance": AttendanceIcon,
  "/weighment": WeighmentIcon,
  "/biomass": BiomassIcon,
  "/biomass/collection": Stage1Icon,
  "/biomass/processing": Stage2Icon,
  "/biomass/storage": Stage3Icon,
  "/biomass/dispatch": Stage4Icon,
  "/inventory": InventoryIcon,
  "/purchase": PurchaseIcon,
  "/sales": SalesIcon,
  "/employees": EmployeesIcon,
  "/reports": ReportsIcon,
  "/alerts": AlertsIcon,
  "/settings": SettingsIcon,
};

