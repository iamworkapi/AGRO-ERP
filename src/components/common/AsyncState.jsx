import { Message } from "primereact/message";
import Loader from "./Loader";

// Renders nothing while idle/succeeded - only shows a loading line or the
// shared error-banner treatment (same style used across create-flow forms).
export default function AsyncState({ status, error, loadingLabel = "Loading…" }) {
  if (status === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Loader size={28} />
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{loadingLabel}</span>
      </div>
    );
  }

  if (status === "failed") {
    return <Message severity="error" text={error || "Something went wrong loading this data."} style={{ width: "100%", justifyContent: "flex-start" }} />;
  }

  return null;
}
