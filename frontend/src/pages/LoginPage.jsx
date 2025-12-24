import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const LoginPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const { login } = useAuth();
    const { showAlert } = useModal();
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/login', { email });
            setStep(2);
            showAlert(`Codul OTP a fost trimis la ${email}`, 'OTP Trimis');
        } catch (err) {
            showAlert(err.response?.data?.message || 'Eroare la trimitere OTP', 'Eroare');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            showAlert('Cod incorect sau expirat', 'Eroare');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec] text-[#4a5568]">
            <div className="neu-card p-10 w-full max-w-md text-center">
                <h1 className="text-3xl font-black mb-2 text-[#6d5dfc]">Autentificare</h1>
                <p className="text-sm text-gray-500 mb-8">Bine ai revenit la Biblioteca Virtuală</p>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <input
                            type="email"
                            placeholder="Email Instituțional"
                            className="neu-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="neu-btn neu-btn-primary w-full py-3 text-lg">
                            Trimite Cod OTP
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <p className="text-sm text-gray-500">Introdu codul primit pe email</p>
                        <input
                            type="text"
                            placeholder="Cod OTP"
                            className="neu-input text-center tracking-[0.5em] font-bold text-xl"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit" className="neu-btn neu-btn-primary w-full py-3 text-lg">
                            Verifică & Intră
                        </button>
                    </form>
                )}

                <div className="mt-8 text-sm">
                    <span className="text-gray-500">Nu ai cont? </span>
                    <Link to="/register" className="text-[#6d5dfc] font-bold hover:underline">Înregistrează-te</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
