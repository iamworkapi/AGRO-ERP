import {
  ChevronDown,
  Search,
  MoreVertical,
  Bell,
  Warehouse,
  ChartPie,
  ClipboardList,
  Scale,
  Boxes,
  ShoppingCart,
  Receipt,
  Users,
  ChartColumn,
  TriangleAlert,
  Sliders,
  Users2,
  Wheat,
  Tractor,
  Gauge,
  Truck,
  Package,
  ArrowRight,
  Plus,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  LogOut,
  Building2,
  Calendar,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Thermometer,
  Droplets,
  Zap,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Download,
  Upload,
  RefreshCw,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

function LucideIcon({ children, size = 18, style = {} }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export { LucideIcon };

// Generic UI icons
export function Chevron({ size = 13, style = {} }) {
  return <LucideIcon size={size} style={style}><path d="m6 9 6 6 6-6" /></LucideIcon>;
}

export function ChevronUp({ size = 13, style = {} }) {
  return <LucideIcon size={size} style={style}><path d="m18 15-6-6-6 6" /></LucideIcon>;
}

export function SearchIcon({ size = 14, style = {} }) {
  return <Search size={size} style={style} />;
}

export function ChevronsLeft({ size = 14, style = {} }) {
  return <ChevronsLeft size={size} style={style} />;
}

export function ChevronsRight({ size = 14, style = {} }) {
  return <ChevronsRight size={size} style={style} />;
}

export function MoreIcon({ size = 14, style = {} }) {
  return <MoreVertical size={size} style={style} />;
}

export function MoreHIcon({ size = 14, style = {} }) {
  return <MoreHorizontal size={size} style={style} />;
}

// Navigation icons
export function DashboardIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><ChartPie size={size} /></LucideIcon>;
}

export function WarehouseIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Warehouse size={size} /></LucideIcon>;
}

export function AttendanceIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><ClipboardList size={size} /></LucideIcon>;
}

export function WeighmentIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Scale size={size} /></LucideIcon>;
}

export function InventoryIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Boxes size={size} /></LucideIcon>;
}

export function PurchaseIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><ShoppingCart size={size} /></LucideIcon>;
}

export function SalesIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Receipt size={size} /></LucideIcon>;
}

export function EmployeesIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Users size={size} /></LucideIcon>;
}

export function ReportsIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><ChartColumn size={size} /></LucideIcon>;
}

export function AlertsIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><TriangleAlert size={size} /></LucideIcon>;
}

export function SettingsIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Sliders size={size} /></LucideIcon>;
}

export function UsersIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Users2 size={size} /></LucideIcon>;
}

export function BiomassIcon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Wheat size={size} /></LucideIcon>;
}

export function Stage1Icon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Tractor size={size} /></LucideIcon>;
}

export function Stage2Icon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Gauge size={size} /></LucideIcon>;
}

export function Stage3Icon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Package size={size} /></LucideIcon>;
}

export function Stage4Icon({ size = 17, style = {} }) {
  return <LucideIcon size={size} style={style}><Truck size={size} /></LucideIcon>;
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
