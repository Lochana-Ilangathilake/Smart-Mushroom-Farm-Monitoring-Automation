import React, { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { db } from '../firebase';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ArrowLeft, Download, Search, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const MiniReport = ({ reading, thresholds }) => {
    if (!reading) return null;

    // Helper to check threshold
    const checkStatus = (val, type) => {
        if (!thresholds || !thresholds[type]) return 'normal';
        const { min, max } = thresholds[type];
        if (val < min) return 'low';
        if (val > max) return 'high';
        return 'normal';
    };

    const StatusBadge = ({ status }) => {
        if (status === 'normal') return <span className="text-emerald-400 text-xs font-bold uppercase">Normal</span>;
        if (status === 'high') return <span className="text-red-400 text-xs font-bold uppercase">High</span>;
        if (status === 'low') return <span className="text-blue-400 text-xs font-bold uppercase">Low</span>;
        return null;
    }

    return (
        <div className="glass-panel p-6 mt-6 animate-in slide-in-from-bottom-2">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search size={20} className="text-blue-400" />
                Snapshot Report: {format(new Date(reading.timestamp * 1000), 'MMM dd, yyyy HH:mm:ss')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sensor Readings</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                            <div className="text-slate-400 text-xs">Temperature</div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-white">{reading.temperature?.toFixed(1)}°C</span>
                                <StatusBadge status={checkStatus(reading.temperature, 'temperature')} />
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                            <div className="text-slate-400 text-xs">Humidity</div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-white">{reading.humidity?.toFixed(1)}%</span>
                                <StatusBadge status={checkStatus(reading.humidity, 'humidity')} />
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                            <div className="text-slate-400 text-xs">Soil Moisture</div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-white">{reading.soilPercent}%</span>
                                <StatusBadge status={checkStatus(reading.soilPercent, 'soilPercent')} />
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                            <div className="text-slate-400 text-xs">CO2</div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-bold text-white">{reading.co2ppm} ppm</span>
                                <StatusBadge status={checkStatus(reading.co2ppm, 'co2')} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

const History = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('week'); // 'week' or 'month'
    const [selectedSensors, setSelectedSensors] = useState({
        temperature: true,
        humidity: true,
        soilPercent: true,
        co2ppm: true,
        lightRaw: true
    });
    const [lookupDate, setLookupDate] = useState('');
    const [selectedSnapshot, setSelectedSnapshot] = useState(null);
    const [searchStatus, setSearchStatus] = useState('idle'); // 'idle', 'found', 'not-found'
    const [thresholds, setThresholds] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const readingsSnap = await get(child(ref(db), 'greenhouse/readings'));
                const thresholdsSnap = await get(child(ref(db), 'greenhouse/thresholds'));

                if (thresholdsSnap.exists()) {
                    setThresholds(thresholdsSnap.val());
                }

                if (readingsSnap.exists()) {
                    const val = readingsSnap.val();
                    let arr = Object.keys(val).map(key => val[key]);

                    // TIME CORRECTION (Same logic as Dashboard)
                    if (arr.length > 0) {
                        arr.sort((a, b) => a.timestamp - b.timestamp);
                        const latestSensorTime = arr[arr.length - 1].timestamp;
                        const currentDeviceTime = Date.now() / 1000;
                        const timeOffset = currentDeviceTime - latestSensorTime;
                        arr = arr.map(d => ({
                            ...d,
                            timestamp: d.timestamp + timeOffset
                        }));
                    }
                    setData(arr);
                    filterData(arr, 'week');
                } else {
                    setData([]);
                    setFilteredData([]);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filterData = (sourceData, filterType) => {
        const now = new Date();
        let startDate;
        if (filterType === 'day') {
            startDate = subDays(now, 1);
        } else if (filterType === 'week') {
            startDate = subDays(now, 7);
        } else if (filterType === 'month2') {
            startDate = subDays(now, 60);
        } else {
            startDate = subDays(now, 30);
        }

        // Filter
        const filtered = sourceData.filter(d => d.timestamp * 1000 >= startDate.getTime());
        setFilteredData(filtered);
        setDateFilter(filterType);
    };

    const handleExport = () => {
        if (filteredData.length === 0) {
            alert("No data to export");
            return;
        }

        const ws = XLSX.utils.json_to_sheet(filteredData.map(row => ({
            Timestamp: format(new Date(row.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss'),
            Temperature: row.temperature,
            Humidity: row.humidity,
            Soil: row.soilPercent,
            CO2: row.co2ppm,
            Light: row.lightRaw,
            // Actuators
            Heater: row.heater ? 'ON' : 'OFF',
            Fan: row.fan ? 'ON' : 'OFF',
            Humidifier: row.humidifier ? 'ON' : 'OFF',
            Light_Actuator: row.light ? 'ON' : 'OFF',
            Pump: row.pump ? 'ON' : 'OFF'
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sensor Data");
        const filename = `mushroom_data_${format(new Date(), 'yyyy_MM')}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const handleLookup = () => {
        if (!lookupDate || data.length === 0) return;
        setSearchStatus('idle');
        const targetTime = new Date(lookupDate).getTime() / 1000;

        // Find closest
        const closest = data.reduce((prev, curr) => {
            return (Math.abs(curr.timestamp - targetTime) < Math.abs(prev.timestamp - targetTime) ? curr : prev);
        });

        // Check tolerance (e.g., within 1 minute = 60 seconds)
        // Adjust this tolerance based on your sensor push interval
        const timeDiff = Math.abs(closest.timestamp - targetTime);
        const toleranceSeconds = 60;

        if (timeDiff <= toleranceSeconds) {
            setSelectedSnapshot(closest);
            setSearchStatus('found');
        } else {
            setSelectedSnapshot(null);
            setSearchStatus('not-found');
        }
    }

    return (
        <div className="p-4 max-w-7xl mx-auto pb-20 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <ArrowLeft className="text-white" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Historical Records</h1>
                    <p className="text-slate-400 text-sm">Analyze batch performance</p>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-panel p-4 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => filterData(data, 'day')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'day' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Last Day
                    </button>
                    <button
                        onClick={() => filterData(data, 'week')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => filterData(data, 'month')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Last 30 Days
                    </button>
                    <button
                        onClick={() => filterData(data, 'month2')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${dateFilter === 'month2' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        Last 2 Months
                    </button>
                </div>

                <button
                    onClick={handleExport}
                    disabled={loading || filteredData.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg shadow-emerald-500/20 font-medium ml-auto"
                >
                    <Download size={18} /> Export XLSX
                </button>
            </div>

            {/* Lookup Section */}
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="text-purple-400" /> Report Lookup
                </h3>
                <div className="flex gap-3 max-w-md">
                    <input
                        type="datetime-local"
                        value={lookupDate}
                        onChange={(e) => setLookupDate(e.target.value)}
                        className="flex-1 input-field text-white"
                    />
                    <button onClick={handleLookup} className="btn-primary">Find</button>
                </div>

                {searchStatus === 'not-found' && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 animate-in slide-in-from-top-2">
                        <AlertCircle className="text-red-400" size={20} />
                        <div>
                            <p className="font-semibold">Record Not Found</p>
                            <p className="text-sm text-red-300/70">No sensor readings found for this specific time (within 1 minute).</p>
                        </div>
                    </div>
                )}

                {searchStatus === 'found' && (
                    <MiniReport reading={selectedSnapshot} thresholds={thresholds} />
                )}
            </div>



        </div>
    );
};

export default History;
