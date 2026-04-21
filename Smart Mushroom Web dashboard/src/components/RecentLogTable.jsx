import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const RecentLogTable = ({ data }) => {
    if (!data || data.length === 0) return null;

    // We assume data is already sorted and sliced to last 30 by the parent
    // But just in case, we splice here too if needed
    const displayData = data.slice().reverse().slice(0, 30); // Show newest first

    return (
        <div className="glass-panel p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Sensor Log</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Time</th>
                            <th className="px-4 py-3">Temp (°C)</th>
                            <th className="px-4 py-3">Humidity (%)</th>
                            <th className="px-4 py-3">Soil (%)</th>
                            <th className="px-4 py-3">Light</th>
                            <th className="px-4 py-3 rounded-r-lg">CO2 (ppm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((row, index) => (
                            <tr key={index} className="border-b border-slate-700/50 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-200">
                                    {format(new Date(row.timestamp * 1000), 'HH:mm:ss')}
                                </td>
                                <td className="px-4 py-3">{row.temperature?.toFixed(1)}</td>
                                <td className="px-4 py-3">{row.humidity?.toFixed(1)}</td>
                                <td className="px-4 py-3">{row.soilPercent}</td>
                                <td className="px-4 py-3">{row.lightRaw}</td>
                                <td className="px-4 py-3">{row.co2ppm}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentLogTable;
