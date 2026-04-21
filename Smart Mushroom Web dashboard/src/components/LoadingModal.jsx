import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingModal = ({ isOpen, message = "Please wait..." }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full animate-in zoom-in-95 duration-200">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                    <Loader2 className="relative text-emerald-400 animate-spin" size={48} />
                </div>
                <h3 className="text-lg font-semibold text-white">{message}</h3>
                <p className="text-slate-400 text-sm text-center">
                    System is switching modes and synchronizing settings.
                </p>
            </div>
        </div>
    );
};

export default LoadingModal;
