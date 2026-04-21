import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';
import { Fan, Flame, Droplets, Zap, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

const ActuatorButton = ({ label, isOn, onClick, icon: Icon, color, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
            "relative p-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-300 border",
            isOn
                ? `bg-${color}-500/20 border-${color}-500/50 shadow-[0_0_15px_rgba(var(--${color}-rgb),0.3)]`
                : "bg-slate-800/40 border-white/5 hover:bg-slate-800/60",
            disabled && "opacity-50 cursor-not-allowed grayscale"
        )}
    >
        <div className={clsx(
            "p-3 rounded-full transition-all duration-300",
            isOn ? `bg-${color}-500 text-white shadow-lg` : "bg-slate-700 text-slate-400"
        )}>
            <Icon size={24} className={clsx(isOn && "animate-pulse")} />
        </div>
        <div className="text-center">
            <div className="font-medium text-slate-200">{label}</div>
            <div className={clsx("text-xs font-bold mt-1", isOn ? `text-${color}-400` : "text-slate-500")}>
                {isOn ? "ON" : "OFF"}
            </div>
        </div>
    </button>
);

const ActuatorPanel = () => {
    const [control, setControl] = useState(null);

    useEffect(() => {
        const controlRef = ref(db, 'greenhouse/control');
        const unsubscribe = onValue(controlRef, (snapshot) => {
            setControl(snapshot.val());
        });
        return () => unsubscribe();
    }, []);

    const toggleActuator = (key) => {
        if (!control || control.actuatorMode !== 'MANUAL') return;
        update(ref(db, 'greenhouse/control'), {
            [key]: !control[key]
        });
    };

    if (!control) return <div className="glass-panel p-8 text-center animate-pulse">Loading controls...</div>;

    const isManual = control.actuatorMode === 'MANUAL';

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Zap className="text-yellow-400" /> Control Panel
                </h2>
                <div className={clsx(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    isManual
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                )}>
                    MODE: {control.actuatorMode}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ActuatorButton
                    label="Heater"
                    isOn={control.heater}
                    onClick={() => toggleActuator('heater')}
                    icon={Flame}
                    color="red" // Need to ensure safelist in tailwind or use style
                    disabled={!isManual}
                />
                <ActuatorButton
                    label="Fan"
                    isOn={control.fan}
                    onClick={() => toggleActuator('fan')}
                    icon={Fan}
                    color="cyan"
                    disabled={!isManual}
                />
                <ActuatorButton
                    label="Humidifier"
                    isOn={control.humidifier}
                    onClick={() => toggleActuator('humidifier')}
                    icon={Droplets}
                    color="blue"
                    disabled={!isManual}
                />
                <ActuatorButton
                    label="Grow Light"
                    isOn={control.light}
                    onClick={() => toggleActuator('light')}
                    icon={Lightbulb}
                    color="yellow"
                    disabled={!isManual}
                />
                <ActuatorButton
                    label="Pump"
                    isOn={control.pump}
                    onClick={() => toggleActuator('pump')}
                    icon={Zap}
                    color="emerald"
                    disabled={!isManual}
                />
            </div>
            {!isManual && (
                <p className="text-xs text-center text-slate-500 mt-4">
                    Switch to MANUAL mode in settings to control actuators.
                </p>
            )}
        </div>
    );
};

export default ActuatorPanel;
