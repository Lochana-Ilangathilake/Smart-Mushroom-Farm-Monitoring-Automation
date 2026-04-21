import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';
import { Settings, Save, RefreshCw } from 'lucide-react';
import LoadingModal from './LoadingModal';
import clsx from 'clsx';

const DEFAULT_THRESHOLDS = {
    temperature: { min: 20, max: 28 },
    humidity: { min: 80, max: 95 },
    soilPercent: { min: 50, max: 75 },
    lightRaw: { min: 200, max: 1500 },
    co2: { min: 400, max: 1200 }
};

const ThresholdInput = ({ label, value, onChange, disabled }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={clsx(
                "bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        />
    </div>
);

const ThresholdGroup = ({ title, min, max, onChangeMin, onChangeMax, disabled }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all">
        <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>
        <div className="grid grid-cols-2 gap-3">
            <ThresholdInput label="Min" value={min} onChange={onChangeMin} disabled={disabled} />
            <ThresholdInput label="Max" value={max} onChange={onChangeMax} disabled={disabled} />
        </div>
    </div>
);

const ThresholdPanel = () => {
    const [thresholds, setThresholds] = useState(null);
    const [localValues, setLocalValues] = useState(null);
    const [mode, setMode] = useState('AUTO');
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const thresholdsRef = ref(db, 'greenhouse/thresholds');
        const unsubscribe = onValue(thresholdsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setThresholds(data);
                if (!isDirty) {
                    setLocalValues(data);
                    setMode(data.mode || 'AUTO');
                }
            }
        });

        // Also listen to control mode just in case it's stored there?
        // Prompt says: "/greenhouse/thresholds -> thresholds: mode -> 'AUTO' or 'MANUAL'"
        // But /greenhouse/control also has actuatorMode. Conflicting?
        // "Actuator Status Panel: Show current states... from /greenhouse/control ... actuatorMode -> 'AUTO' or 'MANUAL'"
        // "Threshold Settings Panel: ... Display AUTO/MANUAL mode toggle"
        // It seems there are TWO modes? Or are they the same?
        // Usually they are the same. Check if user specified synching.
        // "Actuator Control Panel: ... Only editable if actuatorMode is 'MANUAL'"
        // "Threshold Settings Panel: ... Display AUTO/MANUAL mode toggle"
        // If I change mode in Threshold panel, I should probably update `greenhouse/control/actuatorMode` AND `greenhouse/thresholds/mode`?
        // Or maybe the ESP32 reads one and syncs?
        // I'll update BOTH to be safe, or just one if I knew which is master.
        // Given the Actuator Panel reads `greenhouse/control/actuatorMode`, I MUST update that one for Actuators to unlock.
        // I will assume they should be kept in sync or point to the same concept.

        return () => unsubscribe();
    }, [isDirty]);


    const handleModeToggle = async () => {
        const newMode = mode === 'AUTO' ? 'MANUAL' : 'AUTO';
        setIsLoading(true);

        try {
            // Wait for 1.5 seconds for better UX (instead of blocking for 30s)
            await new Promise(resolve => setTimeout(resolve, 1500));

            const updates = {};
            updates['greenhouse/thresholds/mode'] = newMode;
            updates['greenhouse/control/actuatorMode'] = newMode;

            // If switching TO Auto (from Manual), reset thresholds to defaults
            if (newMode === 'AUTO') {
                Object.keys(DEFAULT_THRESHOLDS).forEach(key => {
                    updates[`greenhouse/thresholds/${key}`] = DEFAULT_THRESHOLDS[key];
                });
                // Also reset local state dirty flag
                setIsDirty(false);
            }

            await update(ref(db), updates);
            setMode(newMode);
        } catch (error) {
            console.error("Error switching mode:", error);
            alert("Failed to switch mode. check connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleValueChange = (category, type, value) => {
        setLocalValues(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [type]: parseFloat(value) || 0
            }
        }));
        setIsDirty(true);
    };

    const saveThresholds = async () => {
        if (!localValues) return;
        try {
            // Construct update object
            const updates = {};
            Object.keys(localValues).forEach(key => {
                if (typeof localValues[key] === 'object') {
                    updates[`greenhouse/thresholds/${key}`] = localValues[key];
                }
            });
            await update(ref(db), updates);
            setIsDirty(false);
        } catch (e) {
            console.error(e);
        }
    };

    const revert = () => {
        setLocalValues(thresholds);
        setIsDirty(false);
    }

    if (!localValues) return <div className="glass-panel p-8 text-center animate-pulse">Loading settings...</div>;

    // Prompt: "Allow user to update thresholds in MANUAL mode"
    // So if mode === 'AUTO', inputs disabled?
    const isWritable = mode === 'MANUAL';

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Settings className="text-slate-200" /> Threshold Settings
                </h2>
                <button
                    onClick={handleModeToggle}
                    className={clsx(
                        "px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg",
                        mode === 'MANUAL'
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                            : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25"
                    )}
                >
                    {mode} MODE
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['temperature', 'humidity', 'soilPercent', 'lightRaw', 'co2'].map(key => (
                    localValues[key] && (
                        <ThresholdGroup
                            key={key}
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                            min={localValues[key].min}
                            max={localValues[key].max}
                            onChangeMin={(v) => handleValueChange(key, 'min', v)}
                            onChangeMax={(v) => handleValueChange(key, 'max', v)}
                            disabled={!isWritable}
                        />
                    )
                ))}
            </div>

            {isWritable && isDirty && (
                <div className="mt-6 flex justify-end gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <button onClick={revert} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5 transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={saveThresholds}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            )}

            {!isWritable && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-200 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    System is running in AUTO mode. Switch to MANUAL to edit thresholds.
                </div>
            )}

            <LoadingModal isOpen={isLoading} message={`Switching to ${mode === 'AUTO' ? 'MANUAL' : 'AUTO'} Mode...`} />
        </div>
    );
};

export default ThresholdPanel;
