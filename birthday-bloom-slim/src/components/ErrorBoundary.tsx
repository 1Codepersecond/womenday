import React, { ReactNode, ReactElement } from "react";
import { useBirthdayStore } from "@/features/core/store/useBirthdayStore";

interface Props {
    children: ReactNode;
    fallback?: ReactElement;
}
interface State {
    hasError: boolean;
    error: Error | null;
}
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            // ErrorBoundary là class nên đọc ngôn ngữ trực tiếp từ store thay vì hook.
            const lang = String(useBirthdayStore.getState().config?.language || '').toLowerCase();
            const isVi = lang === 'vi' || lang === 'vietnamese' || lang === 'tiengviet';
            // Never leak internal error details to end users in production.
            return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-center">
          <div className="bg-[#1a1a1a] p-8 rounded-2xl max-w-2xl w-full border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">{isVi ? "Ôi! Có lỗi xảy ra 😔" : "Oops! Something went wrong 😔"}</h2>
            <p className="text-white/60 mb-6">{isVi ? "Đã có lỗi không mong muốn khi tải trang này." : "An unexpected error occurred while loading this page."}</p>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-black/50 p-4 rounded text-left overflow-auto mb-6 text-red-400 font-mono text-sm max-h-[300px]">
                {this.state.error.toString()}
                <br/><br/>
                {this.state.error.stack}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-full transition-colors"
            >
              {isVi ? "Tải lại trang" : "Reload Page"}
            </button>
          </div>
        </div>
      );
        }
        return this.props.children;
    }
}
