/* ---- Generic UI icons using Remix Icon ---- */

export function Chevron({ size = 16, style = {}, className = "" }) {
  return <i className={`ri-arrow-down-s-line ${className}`} style={{ fontSize: size, ...style }} />;
}

export function SearchIcon({ size = 16, style = {}, className = "" }) {
  return <i className={`ri-search-line ${className}`} style={{ fontSize: size, ...style }} />;
}

export function ChevronsLeft({ size = 16, style = {}, className = "" }) {
  return <i className={`ri-arrow-left-double-line ${className}`} style={{ fontSize: size, ...style }} />;
}

export function ChevronsRight({ size = 16, style = {}, className = "" }) {
  return <i className={`ri-arrow-right-double-line ${className}`} style={{ fontSize: size, ...style }} />;
}

export function MoreIcon({ size = 16, style = {}, className = "" }) {
  return <i className={`ri-more-2-fill ${className}`} style={{ fontSize: size, ...style }} />;
}

/* ---- Navigation group icons (Large Remix Icons) ---- */

export function DashboardIcon({ size = 20, style = {} }) {
  return <i className="ri-dashboard-3-line" style={{ fontSize: size, ...style }} />;
}

export function WarehouseIcon({ size = 20, style = {} }) {
  return <i className="ri-building-line" style={{ fontSize: size, ...style }} />;
}

export function AttendanceIcon({ size = 20, style = {} }) {
  return <i className="ri-calendar-check-line" style={{ fontSize: size, ...style }} />;
}

export function WeighmentIcon({ size = 20, style = {} }) {
  return <i className="ri-scales-3-line" style={{ fontSize: size, ...style }} />;
}

export function BuyersIcon({ size = 20, style = {} }) {
  return <i className="ri-building-4-line" style={{ fontSize: size, ...style }} />;
}

export function InventoryIcon({ size = 20, style = {} }) {
  return <i className="ri-archive-line" style={{ fontSize: size, ...style }} />;
}

export function PurchaseIcon({ size = 20, style = {} }) {
  return <i className="ri-shopping-cart-line" style={{ fontSize: size, ...style }} />;
}

export function SalesIcon({ size = 20, style = {} }) {
  return <i className="ri-file-list-3-line" style={{ fontSize: size, ...style }} />;
}

export function EmployeesIcon({ size = 20, style = {} }) {
  return <i className="ri-team-line" style={{ fontSize: size, ...style }} />;
}

export function ReportsIcon({ size = 20, style = {} }) {
  return <i className="ri-bar-chart-box-line" style={{ fontSize: size, ...style }} />;
}

export function AlertsIcon({ size = 20, style = {} }) {
  return <i className="ri-alert-line" style={{ fontSize: size, ...style }} />;
}

export function SettingsIcon({ size = 20, style = {} }) {
  return <i className="ri-settings-3-line" style={{ fontSize: size, ...style }} />;
}

export function UsersIcon({ size = 20, style = {} }) {
  return <i className="ri-user-shared-line" style={{ fontSize: size, ...style }} />;
}

export function BiomassIcon({ size = 20, style = {} }) {
  return <i className="ri-plant-line" style={{ fontSize: size, ...style }} />;
}

export function Stage1Icon({ size = 20, style = {} }) {
  return <i className="ri-truck-line" style={{ fontSize: size, ...style }} />;
}

export function Stage2Icon({ size = 20, style = {} }) {
  return <i className="ri-settings-line" style={{ fontSize: size, ...style }} />;
}

export function Stage3Icon({ size = 20, style = {} }) {
  return <i className="ri-stack-line" style={{ fontSize: size, ...style }} />;
}

export function Stage4Icon({ size = 20, style = {} }) {
  return <i className="ri-truck-line" style={{ fontSize: size, ...style }} />;
}

export const NAV_ICONS = {
  "/": DashboardIcon,
  "/warehouses": WarehouseIcon,
  "/users": UsersIcon,
  "/attendance": AttendanceIcon,
  "/weighment": WeighmentIcon,
  "/biomass/vendors": BuyersIcon,
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
  "/settings/my-profile": SettingsIcon,
};
