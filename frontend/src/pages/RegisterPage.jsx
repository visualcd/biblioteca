import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import api from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'student',
        student_id: '',
        year: '',
        group: '',
        bio: ''
    });
    const { showAlert } = useModal();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            showAlert('Cont creat! Verifică emailul pentru codul OTP la prima logare.', 'Succes');
            navigate('/login');
        } catch (err) {
            showAlert(err.response?.data?.message || 'Eroare la înregistrare', 'Eroare');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#e0e5ec] text-[#4a5568] py-10">
            <div className="neu-card p-10 w-full max-w-lg">
                <h1 className="text-3xl font-black mb-8 text-center text-[#6d5dfc]">Înregistrare</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input className="neu-input" placeholder="Nume Complet" required
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                    <input className="neu-input" type="email" placeholder="Email Instituțional" required
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />

                    <div className="flex flex-wrap gap-4 items-center justify-center p-2">
                        <label className="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="role" value="student" checked={formData.role === 'student'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })} />
                            Student
                        </label>
                        <label className="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="role" value="autor" checked={formData.role === 'autor'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })} />
                            Autor
                        </label>
                        <label className="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="role" value="profesor" checked={formData.role === 'profesor'}
                                onChange={e => setFormData({ ...formData, role: e.target.value })} />
                            Profesor
                        </label>
                    </div>

                    {formData.role === 'student' && (
                        <div className="space-y-4 animate-fade-in-down">
                            <input className="neu-input" placeholder="Număr Matricol" required
                                value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} />
                            <div className="flex gap-4">
                                <input className="neu-input" placeholder="An" required
                                    value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                <input className="neu-input" placeholder="Grupă" required
                                    value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {(formData.role === 'autor' || formData.role === 'profesor') && (
                        <div className="animate-fade-in-down">
                            <textarea className="neu-input h-24" placeholder="Scurtă biografie / Domenii de interes..."
                                value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                        </div>
                    )}

                    <button type="submit" className="neu-btn neu-btn-primary w-full py-3 text-lg font-bold">
                        Creează Cont
                    </button>
                </form>

                <div className="mt-8 text-sm text-center">
                    <span className="text-gray-500">Ai deja cont? </span>
                    <Link to="/login" className="text-[#6d5dfc] font-bold hover:underline">Autentifică-te</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
