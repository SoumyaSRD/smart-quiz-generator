import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, ChevronDown, Terminal, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
          {/* Animated Background Mesh (Fallback for error state) */}
          <div className="fixed inset-0 z-[-1] opacity-20">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_#ef4444_0%,_transparent_50%)]" />
             <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_#a855f7_0%,_transparent_50%)]" />
          </div>

          <div className="w-full max-w-4xl theme-card bg-card/60 backdrop-blur-3xl border border-red-500/20 p-8 md:p-12 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 ring-8 ring-red-500/5 animate-pulse">
                <AlertOctagon size={44} />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white mb-2">
                Critical <span className="text-red-500">Failure</span>
              </h1>
              <p className="text-muted font-bold tracking-widest text-[10px] uppercase opacity-60">System core has encountered an illegal instruction</p>
            </div>

            <div className="space-y-6">
              {/* Error Summary */}
              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <Terminal size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Error Logs</span>
                </div>
                <p className="text-white font-mono text-sm font-bold break-words">
                  {this.state.error && this.state.error.toString()}
                </p>
              </div>

              {/* Technical Breakdown */}
              <div className="theme-card bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 bg-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted ml-2">Trace Analysis</span>
                  <ChevronDown size={14} className="text-muted" />
                </div>
                <div className="p-6 max-h-[300px] overflow-y-auto font-mono text-[11px] leading-relaxed text-muted/80 scrollbar-hide">
                  <div className="space-y-4">
                    <div>
                       <p className="text-accent mb-1 uppercase font-black text-[9px] tracking-widest opacity-50 underline">Component Stack</p>
                       <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                    </div>
                    <div>
                       <p className="text-red-400 mb-1 uppercase font-black text-[9px] tracking-widest opacity-50 underline">Raw Stack Trace</p>
                       <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={this.handleReset}
                  className="flex-1 theme-button-primary bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] py-4 flex items-center justify-center gap-3 uppercase tracking-widest text-xs font-black"
                >
                  <RefreshCw size={18} />
                  Reset System Core
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Export Error Report
                </button>
              </div>
            </div>
            
            <p className="mt-8 text-center text-[9px] font-black uppercase tracking-[0.3em] text-muted opacity-30">
              BrainWave v2.0 • Security Protocol Enabled
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
