import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const LibrarianDashboard = () => {
    const { logout, user } = useAuth();
    const { showConfirm, showAlert } = useModal();
    const [activeTab, setActiveTab] = useState('catalog'); // catalog, approvals, loans

    // Data States
    const [loans, setLoans] = useState([]);
    const [pendingBooks, setPendingBooks] = useState([]);
    const [catalogBooks, setCatalogBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null); // Modal state

    // Catalog Filters
    const [search, setSearch] = useState('');
    const [isDigitalView, setIsDigitalView] = useState(false); // Toggle: false=Physical, true=Digital
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [limitOptions] = useState([10, 20, 50, 100, 'all']);

    // Loans Filters
    const [loansFilter, setLoansFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [loansPage, setLoansPage] = useState(1);
    const [loansLimit, setLoansLimit] = useState(10);

    const getGreeting = () => {
        if (!user?.name) return 'Bună, Bibliotecar';
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
        return `Bună, ${firstName} ${lastInitial}`;
    };

    useEffect(() => {
        if (activeTab === 'loans') fetchLoans();
        if (activeTab === 'approvals') fetchPendingBooks();
        if (activeTab === 'catalog') fetchCatalog();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'catalog') fetchCatalog();
    }, [pagination.page, pagination.limit, search, isDigitalView]);

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getProcessedLoans = () => {
        let processed = [...loans];

        // Filter
        if (loansFilter !== 'all') {
            processed = processed.filter(l => l.status === loansFilter);
        }

        // Sort
        if (sortConfig.key) {
            processed.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Handling nested objects for sort
                if (sortConfig.key === 'student') {
                    aVal = a.student?.name || '';
                    bVal = b.student?.name || '';
                }
                if (sortConfig.key === 'book') {
                    aVal = a.book?.title || '';
                    bVal = b.book?.title || '';
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return processed;
    };

    const fetchPendingBooks = async () => {
        try {
            const res = await api.get('/books?status=draft');
            setPendingBooks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCatalog = async () => {
        try {
            const res = await api.get(`/books`, {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    search: search,
                    is_digital: isDigitalView
                }
            });
            if (res.data.pagination) {
                setCatalogBooks(res.data.data);
                setPagination(prev => ({ ...prev, ...res.data.pagination }));
            } else {
                setCatalogBooks(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReturn = async (loanId) => {
        try {
            await api.put(`/loans/${loanId}/return`);
            fetchLoans();
            showAlert('Carte returnată cu succes!', 'Succes');
        } catch (err) {
            showAlert('Eroare la retur', 'Eroare');
        }
    };

    const handleApproveBook = async (bookId) => {
        try {
            await api.post(`/books/${bookId}/approve`, { status: 'published' });
            fetchPendingBooks();
            showAlert('Carte aprobată și publicată!', 'Succes');
        } catch (err) {
            showAlert('Eroare la aprobare', 'Eroare');
        }
    };

    // Helper to fix paths
    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        return `http://localhost:5000/${cleanPath}`;
    };

    return (
        <div className="min-h-screen flex bg-[#e0e5ec] text-[#4a5568]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#e0e5ec] shadow-[5px_0_15px_rgba(0,0,0,0.05)] z-10 flex flex-col h-screen fixed left-0 top-0">
                <div className="p-6 flex flex-col items-center justify-center text-center">
                    <img src="/logo.png" alt="Logo" className="w-full h-auto mb-4 drop-shadow-md block" />
                    <h1 className="text-2xl font-black text-[#6d5dfc]">{getGreeting()}</h1>
                    <p className="text-xs text-gray-400 mt-1">Panou Bibliotecar</p>
                </div>

                <nav className="flex-1 px-4 space-y-4">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'catalog' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        📚 Catalog General
                    </button>
                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'approvals' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        📝 Cereri Aprobare
                        {pendingBooks.length > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingBooks.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'loans' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        🔄 Împrumuturi
                    </button>
                </nav>

                <div className="p-8">
                    <button onClick={logout} className="neu-btn neu-btn-danger w-full py-3">Delogare</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto w-full">
                {/* Catalog View */}
                {activeTab === 'catalog' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                            <div className="flex items-center gap-6">
                                <h2 className="text-3xl font-bold text-[#6d5dfc]">Catalog Cărți</h2>

                                {/* TOGGLE FILTER */}
                                <div
                                    className={`relative w-36 h-10 rounded-full cursor-pointer transition-colors duration-300 flex items-center p-1 ${isDigitalView ? 'bg-[#00a30e]' : 'bg-[#6d5dfc]'}`}
                                    onClick={() => { setIsDigitalView(!isDigitalView); setPagination(p => ({ ...p, page: 1 })); }}
                                >
                                    <div
                                        className={`absolute w-16 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ${isDigitalView ? 'translate-x-[72px]' : 'translate-x-[2px]'}`}
                                    ></div>
                                    <span className={`z-10 w-1/2 text-center text-xs font-bold transition-colors ${!isDigitalView ? 'text-[#6d5dfc]' : 'text-white'}`}>Fizic</span>
                                    <span className={`z-10 w-1/2 text-center text-xs font-bold transition-colors ${isDigitalView ? 'text-[#00a30e]' : 'text-white'}`}>E-Book</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Caută ISBN, Titlu..."
                                    className="neu-input w-full md:w-80"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                                />
                                <select className="neu-input w-24" value={pagination.limit === 10000 ? 'all' : pagination.limit} onChange={(e) => setPagination(p => ({ ...p, limit: e.target.value === 'all' ? 10000 : Number(e.target.value), page: 1 }))}>
                                    {limitOptions.map(opt => <option key={opt} value={opt}>{opt === 'all' ? 'Toate' : opt}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {catalogBooks
                                .slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
                                .map(book => (
                                    <div
                                        key={book.id}
                                        onClick={() => setSelectedBook(book)}
                                        className="neu-card p-4 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    >
                                        {book.image_url ? (
                                            <img src={getFileUrl(book.image_url)} alt="Cover" className="w-24 h-36 object-cover rounded shadow mb-3" />
                                        ) : (
                                            <div className="w-24 h-36 bg-gray-200 rounded flex items-center justify-center text-xs mb-3 font-bold text-gray-400">No Cover</div>
                                        )}
                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[2.5em]">{book.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{book.author?.name}</p>
                                        <p className="text-xs text-[#6d5dfc] font-semibold">{book.publication_year}</p>
                                        <div className="mt-2 w-full flex justify-between px-2 text-[10px] text-gray-400">
                                            <span>{book.status === 'published' ? '🟢 Public' : '🔴 Draft'}</span>
                                            <span>Stoc: {book.available_stock}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Pagination Controls */}
                        {catalogBooks.length > pagination.limit && (
                            <div className="flex justify-center gap-4 mt-10">
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                    className="neu-btn px-4 py-2 disabled:opacity-50"
                                >
                                    &laquo; Prev
                                </button>
                                <span className="pt-2 font-bold text-gray-600">
                                    Pg {pagination.page} / {Math.ceil(catalogBooks.length / pagination.limit)}
                                </span>
                                <button
                                    disabled={pagination.page >= Math.ceil(catalogBooks.length / pagination.limit)}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                    className="neu-btn px-4 py-2 disabled:opacity-50"
                                >
                                    Next &raquo;
                                </button>
                            </div>
                        )}
                        {catalogBooks.length === 0 && <p className="text-center text-gray-400 mt-10">Nu s-au găsit cărți.</p>}
                    </div>
                )}

                {/* Approvals View */}
                {activeTab === 'approvals' && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-[#6d5dfc] mb-10">Cărți în Așteptare</h2>
                        <div className="space-y-6">
                            {pendingBooks.map(book => (
                                <div key={book.id} className="neu-card p-6 flex flex-col sm:flex-row gap-6 items-center">
                                    {book.image_url ? (
                                        <img src={getFileUrl(book.image_url)} alt="Cover" className="w-24 h-36 object-cover rounded-lg shadow-md" />
                                    ) : (
                                        <div className="w-24 h-36 bg-gray-200 rounded-lg flex items-center justify-center text-xs">No Cover</div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
                                        <p className="text-gray-600">Autor: <span className="font-bold">{book.author?.name}</span></p>
                                        <p className="text-sm text-gray-500 mt-2">{book.description || 'Fără descriere'}</p>
                                        <div className="mt-4 flex gap-4">
                                            {book.pdf_path && (
                                                <a href={getFileUrl(book.pdf_path)} target="_blank" rel="noopener noreferrer" className="text-[#6d5dfc] underline font-bold">
                                                    📄 Deschide Manuscris (PDF)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 min-w-[150px]">
                                        <button onClick={() => handleApproveBook(book.id)} className="neu-btn neu-btn-primary py-2 px-6 flex justify-center items-center gap-2 text-sm">
                                            ✅ Aprobă
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pendingBooks.length === 0 && (
                                <div className="text-center p-20 text-gray-400 text-xl font-light">
                                    Toate cărțile au fost procesate.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Loans View */}
                {activeTab === 'loans' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-bold text-[#6d5dfc]">Gestionare Împrumuturi</h2>

                            <div className="flex gap-4 items-center">
                                <span className="text-sm font-bold text-gray-500">Arată:</span>
                                <select
                                    className="neu-input w-24 text-center"
                                    value={loansLimit}
                                    onChange={(e) => { setLoansLimit(Number(e.target.value)); setLoansPage(1); }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>

                                <select
                                    className="neu-input"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setLoansFilter(val);
                                        setLoansPage(1);
                                    }}
                                >
                                    <option value="all">Toate</option>
                                    <option value="active">Active</option>
                                    <option value="returned">Returnate</option>
                                </select>
                            </div>
                        </div>

                        <div className="neu-card p-0 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100/50 border-b">
                                    <tr>
                                        <th className="p-4 text-gray-500 font-bold text-xs uppercase cursor-pointer hover:text-[#6d5dfc]" onClick={() => handleSort('student')}>Student ↕</th>
                                        <th className="p-4 text-gray-500 font-bold text-xs uppercase cursor-pointer hover:text-[#6d5dfc]" onClick={() => handleSort('book')}>Carte ↕</th>
                                        <th className="p-4 text-gray-500 font-bold text-xs uppercase cursor-pointer hover:text-[#6d5dfc]" onClick={() => handleSort('loan_date')}>Data Împrumut ↕</th>
                                        <th className="p-4 text-gray-500 font-bold text-xs uppercase cursor-pointer hover:text-[#6d5dfc]" onClick={() => handleSort('return_due_date')}>Data Limită ↕</th>
                                        <th className="p-4 text-gray-500 font-bold text-xs uppercase text-center">Acțiune</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {getProcessedLoans()
                                        .slice((loansPage - 1) * loansLimit, loansPage * loansLimit)
                                        .map(loan => (
                                            <tr key={loan.id} className={`hover:bg-white/40 transition-colors ${loan.status === 'returned' ? 'bg-green-50/50' : ''}`}>
                                                <td className="p-4 font-bold text-gray-700">
                                                    {loan.student?.name}
                                                    <br /><span className="text-[10px] text-gray-400">{loan.student?.email}</span>
                                                </td>
                                                <td className="p-4 text-indigo-600 font-medium">{loan.book?.title}</td>
                                                <td className="p-4 text-gray-600 font-medium">
                                                    {loan.loan_date ? new Date(loan.loan_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className={`p-4 font-bold ${loan.status === 'returned' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {new Date(loan.return_due_date).toLocaleDateString()}
                                                    {loan.status === 'returned' && <span className="ml-2 text-[10px] uppercase border border-green-200 px-2 py-0.5 rounded-full bg-green-100">Returnat</span>}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {loan.status !== 'returned' && (
                                                        <button onClick={() => handleReturn(loan.id)} className="neu-btn px-4 py-2 text-xs text-green-700">
                                                            Marchează Retur
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {loans.length === 0 && <p className="text-center p-8 text-gray-400">Nu există împrumuturi.</p>}

                            {/* PAGINATION CONTROLS */}
                            {getProcessedLoans().length > loansLimit && (
                                <div className="flex justify-center gap-4 p-4 border-t border-gray-100">
                                    <button
                                        disabled={loansPage === 1}
                                        onClick={() => setLoansPage(p => p - 1)}
                                        className="neu-btn px-4 py-2 disabled:opacity-50 text-xs"
                                    >
                                        &laquo; Prev
                                    </button>
                                    <span className="pt-2 font-bold text-gray-600 text-xs">
                                        Pg {loansPage} / {Math.ceil(getProcessedLoans().length / loansLimit)}
                                    </span>
                                    <button
                                        disabled={loansPage >= Math.ceil(getProcessedLoans().length / loansLimit)}
                                        onClick={() => setLoansPage(p => p + 1)}
                                        className="neu-btn px-4 py-2 disabled:opacity-50 text-xs"
                                    >
                                        Next &raquo;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Book Details Modal */}
            {selectedBook && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="neu-card p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-scale-in">
                        <button
                            onClick={() => setSelectedBook(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition font-bold"
                        >
                            ✕
                        </button>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                {selectedBook.image_url ? (
                                    <img src={getFileUrl(selectedBook.image_url)} alt="Cover" className="w-64 h-96 object-cover rounded-xl shadow-lg" />
                                ) : (
                                    <div className="w-64 h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-bold">No Cover</div>
                                )}

                                <div className="mt-6 flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Status Publicare</span>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <span className={`text-xs font-bold ${selectedBook.status === 'draft' ? 'text-red-500' : 'text-gray-400'}`}>Draft</span>
                                        <input
                                            type="checkbox"
                                            className="neu-checkbox"
                                            checked={selectedBook.status === 'published'}
                                            onChange={async (e) => {
                                                const newStatus = e.target.checked ? 'published' : 'draft';
                                                try {
                                                    await api.post(`/books/${selectedBook.id}/approve`, { status: newStatus });
                                                    // Update local state
                                                    setSelectedBook(prev => ({ ...prev, status: newStatus }));
                                                    // Refresh catalog background
                                                    fetchCatalog();
                                                } catch (err) {
                                                    showAlert('Eroare la actualizare status', 'Eroare');
                                                }
                                            }}
                                        />
                                        <span className={`text-xs font-bold ${selectedBook.status === 'published' ? 'text-green-600' : 'text-gray-400'}`}>Publicat</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-800">{selectedBook.title}</h2>
                                    <p className="text-xl text-[#6d5dfc] font-medium mt-1">{selectedBook.author?.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <p><span className="font-bold text-gray-800">ISBN:</span> {selectedBook.isbn}</p>
                                    <p><span className="font-bold text-gray-800">An Publicare:</span> {selectedBook.publication_year}</p>
                                    <p><span className="font-bold text-gray-800">Editura:</span> {selectedBook.publisher}</p>
                                    <p><span className="font-bold text-gray-800">Ediția/Volum:</span> {selectedBook.edition || '-'}</p>
                                    <p><span className="font-bold text-gray-800">Categorie:</span> {selectedBook.category}</p>
                                    <p><span className="font-bold text-gray-800">Stoc Disponibil:</span> {selectedBook.pdf_path ? <span className="text-green-600 font-bold">Nelimitat (E-Book)</span> : `${selectedBook.available_stock} / ${selectedBook.total_stock}`}</p>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-700 mb-2">Descriere</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{selectedBook.description || 'Fără descriere disponibilă pentru această carte.'}</p>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    {selectedBook.pdf_path && (
                                        <a href={getFileUrl(selectedBook.pdf_path)} target="_blank" rel="noopener noreferrer" className="neu-btn neu-btn-primary px-6 py-3 flex-1 text-center font-bold">
                                            📖 Citește Carte Online
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibrarianDashboard;
