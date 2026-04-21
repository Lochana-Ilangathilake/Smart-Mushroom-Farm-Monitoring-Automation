import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isDangerous }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white font-medium shadow-lg transition-all ${isDangerous
                                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
