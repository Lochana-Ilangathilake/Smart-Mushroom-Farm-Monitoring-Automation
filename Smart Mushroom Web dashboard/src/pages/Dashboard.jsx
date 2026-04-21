import React, { useState } from 'react';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase';
import SensorPanel from '../components/SensorPanel';
import ActuatorPanel from '../components/ActuatorPanel';
import ThresholdPanel from '../components/ThresholdPanel';
import AlertsPanel from '../components/AlertsPanel';
import SensorChart from '../components/SensorChart';
import ConfirmationModal from '../components/ConfirmationModal';
import { Sprout, Trash2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleStartNewBatch = async () => {
        try {
            await remove(ref(db, 'greenhouse/readings'));
            setIsDeleteModalOpen(false);
        } catch (e) {
            console.error("Error clearing batch:", e);
            alert("Failed to delete readings.");
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    {/* Maybe showing last update time or batch ID? */}
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => navigate('/history')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all shadow-lg font-medium"
                    >
                        <History size={18} /> Historical Records
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 font-medium"
                    >
                        <Trash2 size={18} /> Start New Batch
                    </button>
                </div>
            </div>

            {/* Sensor Panel */}
            <section>
                <SensorPanel />
            </section>

            {/* Charts */}
            <section>
                <SensorChart />
            </section>

            {/* Control & Alerts Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActuatorPanel />
                </div>
                <div className="lg:col-span-1">
                    <AlertsPanel />
                </div>
            </section>

            {/* Threshold Panel */}
            <section>
                <ThresholdPanel />
            </section>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleStartNewBatch}
                title="Start New Batch?"
                message="Starting a new batch will permanently delete ALL existing sensor readings. This action cannot be undone. Actuator settings and Thresholds will remain unchanged."
                isDangerous={true}
            />

        </div>
    );
};

export default Dashboard;
