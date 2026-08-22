import Badge from "../common/Badge";

export default function WarehouseTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: "left", color: "var(--text-secondary)", fontSize: 11, textTransform: "uppercase" }}>
          <th style={{ padding: "8px 6px", fontWeight: 600 }}>Warehouse</th>
          <th style={{ padding: "8px 6px", fontWeight: 600 }}>Commodity</th>
          <th style={{ padding: "8px 6px", fontWeight: 600 }}>Stock</th>
          <th style={{ padding: "8px 6px", fontWeight: 600 }}>Attendance</th>
          <th style={{ padding: "8px 6px", fontWeight: 600 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} style={{ borderTop: "1px solid var(--border)" }}>
            <td style={{ padding: "10px 6px", fontWeight: 600, color: "var(--navy)" }}>{r.name}</td>
            <td style={{ padding: "10px 6px", color: "var(--text-secondary)" }}>{r.commodity}</td>
            <td style={{ padding: "10px 6px" }}>{r.stock}</td>
            <td style={{ padding: "10px 6px" }}>{r.attendance}</td>
            <td style={{ padding: "10px 6px" }}>
              <Badge variant={r.status === "Active" ? "success" : "warning"}>{r.status}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
