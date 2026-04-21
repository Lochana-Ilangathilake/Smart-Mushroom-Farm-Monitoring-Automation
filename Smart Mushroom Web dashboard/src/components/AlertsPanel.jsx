import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const AlertItem = ({ sensor, status }) => {
    if (status === 'NORMAL') return null; // Only show active alerts? Or show all status?
    // "Highlight sensors in red if HIGH, blue if LOW, green if NORMAL"
    // If panel is "Alerts Panel", showing Normal might clutter it. 
    // However, "Highlight sensors... green if NORMAL" implies showing them.

    const colors = {
        HIGH: "bg-red-500/20 border-red-500/50 text-red-200",
        LOW: "bg-blue-500/20 border-blue-500/50 text-blue-200",
        NORMAL: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 opacity-60"
    };

    const icons = {
        HIGH: <AlertTriangle size={20} className="text-red-400" />,
        LOW: <AlertCircle size={20} className="text-blue-400" />,
        NORMAL: <CheckCircle size={20} className="text-emerald-400" />
    };

    return (
        <div className={clsx(
            "flex items-center justify-between p-3 rounded-lg border transition-all",
            colors[status] || colors.NORMAL
        )}>
            <div className="flex items-center gap-3">
                {icons[status] || icons.NORMAL}
                <span className="font-medium capitalize">{sensor}</span>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-black/20">
                {status}
            </span>
        </div>
    );
};

const AlertsPanel = () => {
    const [alerts, setAlerts] = useState({});

    useEffect(() => {
        const alertsRef = ref(db, 'greenhouse/alerts');
        const unsubscribe = onValue(alertsRef, (snapshot) => {
            setAlerts(snapshot.val() || {});
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="glass-panel p-6 h-full">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="text-amber-400" /> System Alerts
            </h2>
            <div className="space-y-3">
                {Object.entries(alerts).map(([sensor, status]) => (
                    <AlertItem key={sensor} sensor={sensor} status={status} />
                ))}
                {Object.keys(alerts).length === 0 && (
                    <div className="text-center text-slate-500 py-8">
                        No alert data active.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
