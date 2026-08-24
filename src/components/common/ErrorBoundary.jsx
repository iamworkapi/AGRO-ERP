import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, onReset } = this.props;
      if (fallback) return fallback(this.state.error, this.handleReset);
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            background: "var(--canvas)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: 18, color: "#1E293B", fontWeight: 700 }}>
            Something went wrong
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B", textAlign: "center", maxWidth: 400 }}>
            The application hit an unexpected error. Your data is safe — you can try reloading the page or going back to the dashboard.
          </p>
          <pre
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 11,
              color: "#991B1B",
              maxWidth: 500,
              overflow: "auto",
              maxHeight: 120,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {onReset && (
              <button
                onClick={() => { this.handleReset(); onReset(); }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#10B981",
                  color: "#FFF",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                background: "#FFF",
                color: "#334155",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
