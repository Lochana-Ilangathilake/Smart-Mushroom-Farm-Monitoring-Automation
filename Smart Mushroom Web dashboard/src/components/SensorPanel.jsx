import React, { useEffect, useState } from 'react';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { db } from '../firebase';
import { Thermometer, Droplets, Sun, Wind, Sprout, Clock } from 'lucide-react';
import { format } from 'date-fns';

const SensorCard = ({ title, value, unit, icon: Icon, color, subValue, subLabel }) => (
    <div className="glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-white/15 transition-all duration-300">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon size={64} className={color} />
        </div>
        <div className={`p-3 rounded-full bg-white/5 mb-4 ${color}`}>
            <Icon size={24} />
        </div>
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className="text-3xl font-bold mt-1 text-white">
            {value} <span className="text-lg text-slate-500 font-normal">{unit}</span>
        </div>
    </div>
);

const SensorPanel = () => {
    const [readings, setReadings] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const readingsRef = query(ref(db, 'greenhouse/readings'), limitToLast(1));
        const unsubscribe = onValue(readingsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const keys = Object.keys(data);
                if (keys.length > 0) {
                    const latestKey = keys[0]; // Since we asked for last 1, it should be the only one
                    setReadings(data[latestKey]);
                    // Use local time when data arrives to avoid confusion if ESP32 clock is wrong
                    setLastUpdated(Date.now() / 1000);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    if (!readings) return (
        <div className="glass-panel p-8 text-center animate-pulse">
            Loading sensors...
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <ActivityIcon /> Live Readings
                </h2>
                {lastUpdated && (
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(lastUpdated * 1000), 'MMM dd, HH:mm:ss')}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <SensorCard
                    title="Temperature"
                    value={readings.temperature?.toFixed(1)}
                    unit="°C"
                    icon={Thermometer}
                    color="text-amber-400"
                />
                <SensorCard
                    title="Humidity"
                    value={readings.humidity?.toFixed(1)}
                    unit="%"
                    icon={Droplets}
                    color="text-blue-400"
                />
                <SensorCard
                    title="Soil Moisture"
                    value={readings.soilPercent}
                    unit="%"
                    icon={Sprout}
                    color="text-emerald-400"
                />
                <SensorCard
                    title="Light"
                    value={readings.lightRaw}
                    unit="ADC"
                    icon={Sun}
                    color="text-yellow-400"
                />
                <SensorCard
                    title="CO2 Levels"
                    value={readings.co2ppm}
                    unit="ppm"
                    icon={Wind}
                    color="text-gray-400"
                />
            </div>
        </div>
    );
};

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
)

export default SensorPanel;
