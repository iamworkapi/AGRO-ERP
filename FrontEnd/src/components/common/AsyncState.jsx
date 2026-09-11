import { Message } from "primereact/message";
import Loader from "./Loader";

/**
 * Centered asynchronous status renderer.
 * When status is "loading", displays a centered orbital loader.
 * When status is "failed", displays an accessible error banner.
 */
export default function AsyncState({
  status,
  error,
  loadingLabel = "Loading…",
  inline = false,
  minHeight,
}) {
  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: inline ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          padding: inline ? "12px 0" : "56px 16px",
          width: "100%",
          minHeight: minHeight ?? (inline ? "auto" : "42vh"),
          boxSizing: "border-box",
        }}
      >
        <Loader size={inline ? 26 : 46} label={loadingLabel} inline={inline} />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div style={{ padding: "12px 0", width: "100%" }}>
        <Message severity="error" text={error || "Something went wrong loading this data."} style={{ width: "100%", justifyContent: "flex-start" }} />
      </div>
    );
  }

  return null;
}
