import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">
              Oops! Có lỗi xảy ra
            </h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || "Đã xảy ra lỗi không xác định"}
            </p>
            <div className="bg-muted p-4 rounded-lg text-left">
              <pre className="text-xs overflow-auto max-h-40">
                {this.state.error?.stack}
              </pre>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                Tải lại trang
              </Button>
              <Button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
                variant="outline"
              >
                Xóa cache & Reset
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

