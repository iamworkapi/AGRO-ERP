import { useNavigate } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "var(--primary-tint)",
        border: "1px solid rgba(0, 184, 107, 0.25)",
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        lineHeight: 1,
        boxShadow: "0 1px 3px rgba(0, 184, 107, 0.08)",
      }}
    >
      {items.map((item, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === items.length - 1;
        const isHome = item.label === "Home";

        return (
          <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            {!isFirst && (
              <i className="ri-arrow-right-s-line" style={{ fontSize: 8, color: "var(--primary-deep)", opacity: 0.5 }} />
            )}

            {item.path && !isLast ? (
              <button
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--ink-secondary)",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 11,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "color 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "var(--primary-deep)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "var(--ink-secondary)")}
              >
                {isHome && <i className="ri-home-4-line" style={{ fontSize: 11, color: "var(--primary-deep)" }} />}

                {item.label}
              </button>
            ) : (
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--primary-deep)",
                  fontSize: 11,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isHome && <i className="ri-home-4-line" style={{ fontSize: 11, color: "var(--primary-deep)" }} />}

                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}