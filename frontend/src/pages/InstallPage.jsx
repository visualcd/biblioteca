import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const InstallPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); // Destructure login

    const handleSendOtp = async (e) => {
        // ... (unchanged)
        e.preventDefault();
        try {
            const res = await api.post('/auth/setup-admin', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Eroare');
        }
    };

    const handleVerifyDto = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/setup-admin', { email, otp });
            // Use login from context
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Eroare OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="glass-card p-8 w-96 text-center">
                <h1 className="text-3xl font-bold mb-6 text-white">Instalare Biblioteca</h1>
                {message && <p className="mb-4 text-yellow-300">{message}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <p className="mb-4 text-gray-300">Configureaza contul de Administrator</p>
                        <input
                            type="email"
                            placeholder="Email Administrator"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input w-full mb-4"
                            required
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition">
                            Trimite OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyDto}>
                        <p className="mb-4 text-gray-300">Introdu codul OTP primit pe email</p>
                        <input
                            type="text"
                            placeholder="Cod OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="glass-input w-full mb-4"
                            required
                        />
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition">
                            Confirma & Finalizeaza
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InstallPage;
