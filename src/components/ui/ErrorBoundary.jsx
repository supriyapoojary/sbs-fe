import React from "react";
import logger from "utils/logger";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        logger.uiError("Component crashed", { error: error.message, stack: info.componentStack });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        padding: "32px",
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        fontFamily: "sans-serif",
                    }}
                >
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
                    <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>Something went wrong</h3>
                    <p style={{ fontSize: "13px", marginBottom: "16px" }}>{this.state.error?.message || "An unexpected error occurred"}</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            background: "var(--accent-primary)",
                            color: "var(--text-inverse)",
                            border: "none",
                            fontSize: "13px",
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
