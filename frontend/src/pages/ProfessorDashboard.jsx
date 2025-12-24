import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const ProfessorDashboard = () => {
    const { logout, user } = useAuth();
    const { showAlert, showConfirm } = useModal();
    const [activeTab, setActiveTab] = useState('my-students'); // 'my-students' | 'all-students'
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Data list
    const [myStudents, setMyStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]); // For adoption list

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Form states
    const [newStudent, setNewStudent] = useState({
        name: '', email: '', faculty: '',
        student_code: '', year_of_study: '', group: '', credits: 0
    });

    const [editStudent, setEditStudent] = useState({
        name: '', email: '', faculty: '',
        student_code: '', year_of_study: '', group: '', credits: 0
    });

    useEffect(() => {
        if (activeTab === 'my-students') fetchMyStudents();
        if (activeTab === 'all-students') fetchAllStudents();
    }, [activeTab]);

    const fetchMyStudents = async () => {
        try {
            const res = await api.get('/users');
            setMyStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const res = await api.get('/users?view=all');
            setAllStudents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ----- ACTIONS -----
    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newStudent);
            setShowCreateModal(false);
            setNewStudent({ name: '', email: '', faculty: '', student_code: '', year_of_study: '', group: '', credits: 0 });
            fetchMyStudents();
            showAlert('Student creat! Verifică emailul pentru codul OTP.', 'Succes');
        } catch (err) {
            showAlert(err.response?.data?.message || 'Eroare la creare', 'Eroare');
        }
    };

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setEditStudent({
            name: student.name,
            email: student.email,
            faculty: student.faculty || '',
            student_code: student.student_code || '',
            year_of_study: student.year_of_study || '',
            group: student.group || '',
            credits: student.credits || 0
        });
        setShowEditModal(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedStudent.id}`, editStudent);
            setShowEditModal(false);
            fetchMyStudents();
            showAlert('Student actualizat!', 'Succes');
        } catch (err) {
            showAlert(err.response?.data?.message || 'Eroare la actualizare', 'Eroare');
        }
    };

    const handleDeleteStudent = async (id) => {
        showConfirm(
            'Sigur ștergi acest student?',
            async () => {
                try {
                    await api.delete(`/users/${id}`);
                    fetchMyStudents();
                } catch (err) {
                    showAlert('Eroare la ștergere', 'Eroare');
                }
            },
            'Ștergere Student'
        );
    };

    const handleClaimStudent = async (student) => {
        showConfirm(
            `Doriți să adăugați studentul ${student.name} în lista dumneavoastră pentru a-l gestiona?`,
            async () => {
                try {
                    await api.put(`/users/${student.id}`, { action: 'claim' });
                    showAlert('Student adăugat în listă!', 'Succes');
                    // Refresh list
                    fetchAllStudents();
                } catch (err) {
                    showAlert('Eroare la adăugare', 'Eroare');
                }
            },
            'Adăugare Student'
        );
    };

    // --- Search & Sort Logic ---
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedStudents = [...myStudents]
        .filter(s => {
            const term = search.toLowerCase();
            return (
                s.name.toLowerCase().includes(term) ||
                (s.student_code && s.student_code.toLowerCase().includes(term))
            );
        })
        .sort((a, b) => {
            if (!sortConfig.key) return 0;

            let valA, valB;
            if (sortConfig.key === 'details') {
                valA = `${a.faculty} ${a.year_of_study} ${a.group}`.toLowerCase();
                valB = `${b.faculty} ${b.year_of_study} ${b.group}`.toLowerCase();
            } else {
                valA = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
                valB = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
            }

            if (sortConfig.key === 'credits') {
                return sortConfig.direction === 'ascending' ? a.credits - b.credits : b.credits - a.credits;
            }

            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    const getGreeting = () => {
        if (!user?.name) return 'Bună, Profesor';
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
        return `Bună, ${firstName} ${lastInitial}`;
    };

    return (
        <div className="min-h-screen flex bg-[#e0e5ec] text-[#4a5568]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#e0e5ec] shadow-[5px_0_15px_rgba(0,0,0,0.05)] z-10 flex flex-col h-screen fixed left-0 top-0">
                <div className="p-8">
                    <h1 className="text-2xl font-black text-[#6d5dfc]">{getGreeting()}</h1>
                    <p className="text-xs text-gray-400 mt-1">Gestiune Studenți</p>
                </div>

                <nav className="flex-1 px-4 space-y-4">
                    <button
                        onClick={() => setActiveTab('my-students')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'my-students' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        🎓 Studenții Mei
                    </button>
                    <button
                        onClick={() => setActiveTab('all-students')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'all-students' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        🌐 Toți Studenții
                    </button>
                </nav>

                <div className="p-8">
                    <button onClick={logout} className="neu-btn neu-btn-danger w-full py-3">Delogare</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto w-full">

                {/* --- MY STUDENTS TAB --- */}
                {activeTab === 'my-students' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                            <h2 className="text-3xl font-bold text-[#6d5dfc] whitespace-nowrap">Studenții Mei</h2>

                            <div className="flex-1 w-full max-w-xl px-4">
                                <input
                                    type="text"
                                    placeholder="Caută student (nume, matricol)..."
                                    className="neu-input w-full"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <button onClick={() => setShowCreateModal(true)} className="neu-btn px-6 py-3 text-[#6d5dfc] font-bold whitespace-nowrap">
                                + Adaugă Student Nou
                            </button>
                        </div>

                        <div className="neu-card p-0 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100/50 border-b">
                                    <tr>
                                        <th onClick={() => handleSort('name')} className="p-4 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition select-none">
                                            Nume / Matricol {getSortIndicator('name')}
                                        </th>
                                        <th onClick={() => handleSort('details')} className="p-4 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition select-none">
                                            Detalii Academice {getSortIndicator('details')}
                                        </th>
                                        <th onClick={() => handleSort('credits')} className="p-4 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition select-none">
                                            Credite {getSortIndicator('credits')}
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredAndSortedStudents.map(s => (
                                        <tr key={s.id} className="hover:bg-white/40">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{s.name}</div>
                                                <div className="text-xs text-gray-400">{s.student_code}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {s.faculty} <br />
                                                <span className="text-xs">An {s.year_of_study}, Gr {s.group}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.credits >= 30 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {s.credits} Puncte
                                                </span>
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button onClick={() => handleEditClick(s)} className="neu-btn px-4 py-2 text-xs text-blue-600">
                                                    Editează
                                                </button>
                                                <button onClick={() => handleDeleteStudent(s.id)} className="neu-btn neu-btn-danger px-4 py-2 text-xs">
                                                    Șterge
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAndSortedStudents.length === 0 && <p className="text-center p-10 text-gray-400">Nu ați adăugat încă niciun student sau nu am găsit rezultate.</p>}
                        </div>
                    </div>
                )}

                {/* --- ALL STUDENTS TAB (TABLE LAYOUT) --- */}
                {activeTab === 'all-students' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-bold text-[#6d5dfc]">Toți Studenții din Sistem</h2>
                            <p className="text-sm text-gray-500 max-w-md text-right">
                                Lista completă a studenților. Aici puteți revendica studenți noi.
                            </p>
                        </div>

                        <div className="neu-card p-0 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100/50 border-b">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nume / Matricol</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Detalii Academice</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {allStudents.map(s => (
                                        <tr key={s.id} className="hover:bg-white/40">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{s.name}</div>
                                                <div className="text-xs text-gray-400">{s.student_code || 'Fără matricol'}</div>
                                                <div className="text-[10px] text-gray-400">{s.email}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {s.faculty || 'Nespecificat'} <br />
                                                <span className="text-xs">An {s.year_of_study || '-'}, Gr {s.group || '-'}</span>
                                            </td>
                                            <td className="p-4">
                                                {s.created_by === user.id ? (
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                                                        Studentul Meu
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                                                        Neasociat
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {s.created_by === user.id ? (
                                                    <button disabled className="neu-btn opacity-50 cursor-not-allowed px-4 py-2 text-xs font-bold border border-green-200 text-green-600">
                                                        Deja adăugat
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleClaimStudent(s)} className="neu-btn px-4 py-2 text-xs text-[#6d5dfc] font-bold hover:bg-[#6d5dfc] hover:text-white transition-colors">
                                                        + Adaugă în Lista Mea
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {allStudents.length === 0 && <p className="text-center p-10 text-gray-400">Nu au fost găsiți studenți în sistem.</p>}
                        </div>
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="neu-card p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                        <h3 className="text-2xl font-bold mb-6 text-[#6d5dfc]">Adaugă Student Nou</h3>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Nume</label>
                                    <input className="neu-input" required
                                        value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Email</label>
                                    <input className="neu-input" type="email" required
                                        value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Facultate</label>
                                    <input className="neu-input"
                                        value={newStudent.faculty} onChange={e => setNewStudent({ ...newStudent, faculty: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Nr. Matricol</label>
                                    <input className="neu-input"
                                        value={newStudent.student_code} onChange={e => setNewStudent({ ...newStudent, student_code: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">An Studiu</label>
                                    <input className="neu-input" type="number"
                                        value={newStudent.year_of_study} onChange={e => setNewStudent({ ...newStudent, year_of_study: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Grupă</label>
                                    <input className="neu-input"
                                        value={newStudent.group} onChange={e => setNewStudent({ ...newStudent, group: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Credite Inițiale</label>
                                    <input className="neu-input" type="number"
                                        value={newStudent.credits} onChange={e => setNewStudent({ ...newStudent, credits: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="neu-btn flex-1 py-3">Anulează</button>
                                <button className="neu-btn neu-btn-primary flex-1 py-3">Creează Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="neu-card p-8 w-full max-w-2xl animate-scale-in">
                        <h3 className="text-2xl font-bold mb-6 text-[#6d5dfc]">Editare Student</h3>
                        <form onSubmit={handleUpdateStudent} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Nume</label>
                                    <input className="neu-input" required
                                        value={editStudent.name} onChange={e => setEditStudent({ ...editStudent, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Email</label>
                                    <input className="neu-input" type="email" required
                                        value={editStudent.email} onChange={e => setEditStudent({ ...editStudent, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">An Studiu</label>
                                    <input className="neu-input" type="number"
                                        value={editStudent.year_of_study} onChange={e => setEditStudent({ ...editStudent, year_of_study: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold ml-1 mb-1">Grupă</label>
                                    <input className="neu-input"
                                        value={editStudent.group} onChange={e => setEditStudent({ ...editStudent, group: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold ml-1 mb-1 text-[#6d5dfc]">Credite (Puncte)</label>
                                    <input className="neu-input text-lg font-bold text-center text-[#6d5dfc]" type="number"
                                        value={editStudent.credits} onChange={e => setEditStudent({ ...editStudent, credits: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} className="neu-btn flex-1 py-3">Anulează</button>
                                <button className="neu-btn neu-btn-primary flex-1 py-3">Salvează Modificările</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessorDashboard;
