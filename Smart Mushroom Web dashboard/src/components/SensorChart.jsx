import React, { useEffect, useState } from 'react';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="font-bold mb-2 text-current">{format(new Date(label * 1000), 'HH:mm:ss')}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1" style={{ color: entry.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span>{entry.name}: {entry.value?.toFixed(1)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const SensorChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch last 50 readings for history
        const historyRef = query(ref(db, 'greenhouse/readings'), limitToLast(30));
        const unsubscribe = onValue(historyRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                let formattedData = Object.keys(val).map(key => ({
                    ...val[key],
                })).sort((a, b) => a.timestamp - b.timestamp);

                // TIME CORRECTION START
                // If we have data, we assume the LATEST reading corresponds to "NOW"
                // This fixes the issue where the ESP32 clock is wrong (e.g. sending future/past dates)
                if (formattedData.length > 0) {
                    const latestSensorTime = formattedData[formattedData.length - 1].timestamp;
                    const currentDeviceTime = Date.now() / 1000;
                    const timeOffset = currentDeviceTime - latestSensorTime;

                    formattedData = formattedData.map(d => ({
                        ...d,
                        timestamp: d.timestamp + timeOffset
                    }));
                }
                // TIME CORRECTION END

                setData(formattedData);
            }
        });

        return () => unsubscribe();
    }, []);

    if (data.length === 0) return null;

    return (
        <div className="flex flex-col gap-6">
            {/* Environmental Chart */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <Activity className="text-purple-400" /> Environmental Trends
                </h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(ts) => format(new Date(ts * 1000), 'HH:mm')}
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="temperature"
                                name="Temperature (°C)"
                                stroke="#fbbf24"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="humidity"
                                name="Humidity (%)"
                                stroke="#60a5fa"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="soilPercent"
                                name="Soil (%)"
                                stroke="#34d399"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Air & Light Chart */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <Activity className="text-yellow-400" /> Air & Light Trends
                </h2>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={(ts) => format(new Date(ts * 1000), 'HH:mm')}
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'Light (ADC)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'CO2 (ppm)', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="lightRaw"
                                name="Light (ADC)"
                                stroke="#fbbf24"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="co2ppm"
                                name="CO2 (ppm)"
                                stroke="#94a3b8"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SensorChart;
