import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const { showAlert, showConfirm } = useModal();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [newUser, setNewUser] = useState({
        name: '', email: '', role: 'student',
        faculty: '', student_code: '', year_of_study: '', group: '', credits: 0
    });

    const [editUser, setEditUser] = useState({
        name: '', email: '', role: '',
        faculty: '', student_code: '', year_of_study: '', group: '', credits: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleActivation = async (id) => {
        try {
            await api.put(`/users/${id}/toggle-activation`);
            fetchUsers();
        } catch (err) {
            showAlert('Eroare la schimbarea statusului', 'Eroare');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            setShowCreateModal(false);
            setNewUser({
                name: '', email: '', role: 'student',
                faculty: '', student_code: '', year_of_study: '', group: '', credits: 0
            });
            fetchUsers();
            showAlert('Utilizator creat! Verifică emailul pentru codul OTP.', 'Succes');
        } catch (err) {
            showAlert(err.response?.data?.message || 'Eroare la creare', 'Eroare');
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditUser({
            name: user.name,
            email: user.email,
            role: user.role,
            faculty: user.faculty || '',
            student_code: user.student_code || '',
            year_of_study: user.year_of_study || '',
            group: user.group || '',
            credits: user.credits || 0
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${selectedUser.id}`, editUser);
            setShowEditModal(false);
            fetchUsers();
            showAlert('Utilizator actualizat!', 'Succes');
        } catch (err) {
            showAlert('Eroare la actualizare', 'Eroare');
        }
    };

    const handleDeleteUser = async (id) => {
        showConfirm(
            'Sigur ștergi acest utilizator permanent?',
            async () => {
                try {
                    await api.delete(`/users/${id}`);
                    fetchUsers();
                } catch (err) {
                    showAlert('Eroare la ștergere', 'Eroare');
                }
            },
            'Ștergere Utilizator'
        );
    }

    // --- Search & Sort Logic ---
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedUsers = [...users]
        .filter(u => {
            const term = search.toLowerCase();
            return (
                u.name.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                (u.role && u.role.toLowerCase().includes(term))
            );
        })
        .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const valA = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
            const valB = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';

            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    const getGreeting = () => {
        if (!user?.name) return 'Bună, Admin';
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
        return `Bună, ${firstName} ${lastInitial}`;
    };

    return (
        <div className="min-h-screen p-10 bg-[#e0e5ec] text-[#4a5568]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex flex-col items-start gap-2">
                    <div className="w-48">
                        <img src="/logo.png" alt="Logo" className="w-full h-auto object-contain drop-shadow-md" />
                    </div>
                    <h1 className="text-4xl font-black text-[#6d5dfc] whitespace-nowrap">{getGreeting()}</h1>
                </div>
                <div className="flex-1 w-full max-w-xl px-4">
                    <input
                        type="text"
                        placeholder="Caută utilizatori..."
                        className="neu-input w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setShowCreateModal(true)} className="neu-btn px-6 py-2 text-[#6d5dfc]">
                        + Adaugă Utilizator
                    </button>
                    <button onClick={logout} className="neu-btn neu-btn-danger px-6 py-2">
                        Delogare
                    </button>
                </div>
            </div>

            <div className="neu-card p-8 overflow-hidden">
                <h2 className="text-2xl font-bold mb-6 text-gray-700">Gestionare Utilizatori</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-300 text-gray-500 uppercase text-xs tracking-wider">
                                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:bg-gray-100 transition select-none">
                                    Nume {getSortIndicator('name')}
                                </th>
                                <th onClick={() => handleSort('email')} className="p-4 cursor-pointer hover:bg-gray-100 transition select-none">
                                    Email {getSortIndicator('email')}
                                </th>
                                <th onClick={() => handleSort('role')} className="p-4 cursor-pointer hover:bg-gray-100 transition select-none">
                                    Rol {getSortIndicator('role')}
                                </th>
                                <th onClick={() => handleSort('isActive')} className="p-4 cursor-pointer hover:bg-gray-100 transition select-none">
                                    Status {getSortIndicator('isActive')}
                                </th>
                                <th className="p-4 text-center">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-100/50 transition">
                                    <td className="p-4 font-semibold text-gray-800">{u.name}</td>
                                    <td className="p-4 text-gray-600">{u.email}</td>
                                    <td className="p-4"><span className="px-3 py-1 rounded-full bg-gray-200 text-xs font-bold text-gray-600 uppercase">{u.role}</span></td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                            {u.isActive ? 'Activ' : 'Inactiv'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-3">
                                        <button onClick={() => toggleActivation(u.id)} className="neu-btn px-3 py-1 text-xs">
                                            {u.isActive ? 'Dezactivează' : 'Activează'}
                                        </button>
                                        <button onClick={() => handleEditClick(u)} className="neu-btn px-3 py-1 text-xs text-blue-600">
                                            Editează
                                        </button>
                                        <button onClick={() => handleDeleteUser(u.id)} className="neu-btn neu-btn-danger px-3 py-1 text-xs">
                                            Șterge
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="neu-card p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6 text-[#6d5dfc]">Utilizator Nou</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input className="neu-input" placeholder="Nume" required
                                value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            <input className="neu-input" type="email" placeholder="Email" required
                                value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />

                            <select className="neu-input"
                                value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="student">Student</option>
                                <option value="autor">Autor</option>
                                <option value="profesor">Profesor</option>
                                <option value="bibliotecar">Bibliotecar</option>
                                <option value="admin">Admin</option>
                            </select>

                            {newUser.role === 'student' && (
                                <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <input className="neu-input" placeholder="Facultate"
                                        value={newUser.faculty} onChange={e => setNewUser({ ...newUser, faculty: e.target.value })} />
                                    <input className="neu-input" placeholder="Nr. Matricol"
                                        value={newUser.student_code} onChange={e => setNewUser({ ...newUser, student_code: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="neu-input" placeholder="An Studiu" type="number"
                                            value={newUser.year_of_study} onChange={e => setNewUser({ ...newUser, year_of_study: e.target.value })} />
                                        <input className="neu-input" placeholder="Grupă"
                                            value={newUser.group} onChange={e => setNewUser({ ...newUser, group: e.target.value })} />
                                    </div>
                                    <input className="neu-input" placeholder="Credite Inițiale" type="number"
                                        value={newUser.credits} onChange={e => setNewUser({ ...newUser, credits: e.target.value })} />
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="neu-btn flex-1 py-2">Anulează</button>
                                <button className="neu-btn neu-btn-primary flex-1 py-2">Creează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="neu-card p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold mb-6 text-[#6d5dfc]">Editare Utilizator</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <input className="neu-input" placeholder="Nume" required
                                value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
                            <input className="neu-input" type="email" placeholder="Email" required
                                value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />

                            <select className="neu-input"
                                value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                                <option value="student">Student</option>
                                <option value="autor">Autor</option>
                                <option value="profesor">Profesor</option>
                                <option value="bibliotecar">Bibliotecar</option>
                                <option value="admin">Admin</option>
                            </select>

                            {editUser.role === 'student' && (
                                <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <input className="neu-input" placeholder="Facultate"
                                        value={editUser.faculty} onChange={e => setEditUser({ ...editUser, faculty: e.target.value })} />
                                    <input className="neu-input" placeholder="Nr. Matricol"
                                        value={editUser.student_code} onChange={e => setEditUser({ ...editUser, student_code: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input className="neu-input" placeholder="An Studiu" type="number"
                                            value={editUser.year_of_study} onChange={e => setEditUser({ ...editUser, year_of_study: e.target.value })} />
                                        <input className="neu-input" placeholder="Grupă"
                                            value={editUser.group} onChange={e => setEditUser({ ...editUser, group: e.target.value })} />
                                    </div>
                                    <input className="neu-input" placeholder="Credite" type="number"
                                        value={editUser.credits} onChange={e => setEditUser({ ...editUser, credits: e.target.value })} />
                                </div>
                            )}

                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} className="neu-btn flex-1 py-2">Anulează</button>
                                <button className="neu-btn neu-btn-primary flex-1 py-2">Salvează</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
