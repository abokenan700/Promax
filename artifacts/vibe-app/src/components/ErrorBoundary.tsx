import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "32px 24px",
            background: "#fafaf8",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#FEF0EE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={28} style={{ color: "var(--error)" }} strokeWidth={1.6} />
          </div>
          <p
            style={{
              fontFamily: "var(--font-main)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            حدث خطأ غير متوقع
          </p>
          <p
            style={{
              fontFamily: "var(--font-main)",
              fontSize: 13,
              color: "var(--text-muted)",
              maxWidth: 280,
            }}
          >
            يرجى إعادة تحميل الصفحة. إذا استمرت المشكلة تواصل مع الدعم.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: "10px 24px",
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--gold), var(--gold-accent))",
              color: "#fff",
              fontFamily: "var(--font-main)",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            إعادة التحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
