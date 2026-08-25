import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import { resolveBreadcrumb } from "../../utils/breadcrumb";

// The one header every dashboard page renders - pass a title (and
// optionally a subtitle), and the breadcrumb trail is derived from the
// current route via navigation.js automatically. Pass an explicit
// `breadcrumb` array only for the rare page that needs a trail
// navigation.js can't express (e.g. a detail page's crumb showing a
// specific record's name).
export default function PageHeader({ title, subtitle, breadcrumb, action }) {
  const location = useLocation();
  const trail = breadcrumb || resolveBreadcrumb(location.pathname, title);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: 10,
        marginBottom: 2,
        borderBottom: "1px solid var(--line)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "var(--ink)", letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)", lineHeight: 1.3 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {action}
        {trail && <Breadcrumb items={trail} />}
      </div>
    </div>
  );
}
