import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const StudentDashboard = () => {
    const { logout, user } = useAuth();
    const { showConfirm, showAlert } = useModal();
    const [activeTab, setActiveTab] = useState('my-loans'); // 'my-loans' | 'catalog'

    // Data
    const [books, setBooks] = useState([]);
    const [myLoans, setMyLoans] = useState([]);

    // Catalog State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);

    const getGreeting = () => {
        if (!user?.name) return 'Bună, Student';
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
        return `Bună, ${firstName} ${lastInitial}`;
    };

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books?status=published');
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLoans = async () => {
        try {
            const res = await api.get('/loans?status=active');
            setMyLoans(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        // Fetch both on mount so counts/data are ready, or fetch on tab change.
        // Fetching both is fine for now.
        fetchBooks();
        fetchLoans();
    }, []);

    // Helper to fix paths
    const getFileUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/\\/g, '/');
        return `http://localhost:5000/${cleanPath}`;
    };

    // Real-time client-side filter
    const filteredBooks = useMemo(() => {
        if (!search) return books;
        return books.filter(book =>
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            (book.isbn && book.isbn.includes(search)) ||
            (book.author?.name && book.author.name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, books]);

    const handleLoan = async (bookId) => {
        showConfirm(
            'Dorești să împrumuți această carte?',
            async () => {
                try {
                    await api.post('/loans', { book_id: bookId });
                    showAlert('Carte împrumutată cu succes!', 'Succes');
                    fetchBooks(); // Refresh stock
                    fetchLoans(); // Refresh my loans
                } catch (err) {
                    showAlert(err.response?.data?.message || 'Eroare la împrumut', 'Eroare');
                }
            },
            'Confirmare Împrumut'
        );
    };

    const handleReturn = async (loanId) => {
        showConfirm(
            'Confirmi returnarea cărții?',
            async () => {
                try {
                    await api.put(`/loans/${loanId}/return`);
                    showAlert('Carte returnată!', 'Succes');
                    fetchBooks(); // Refresh stock
                    fetchLoans(); // Refresh loans
                } catch (err) {
                    showAlert('Eroare la retur', 'Eroare');
                }
            },
            'Returnare Carte'
        );
    };

    return (
        <div className="min-h-screen flex bg-[#e0e5ec] text-[#4a5568]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#e0e5ec] shadow-[5px_0_15px_rgba(0,0,0,0.05)] z-10 flex flex-col h-screen fixed left-0 top-0">
                <div className="p-6 flex flex-col items-center justify-center text-center">
                    <img src="/logo.png" alt="Logo" className="w-full h-auto mb-4 drop-shadow-md block" />
                    <h1 className="text-2xl font-black text-[#6d5dfc]">{getGreeting()}</h1>
                    <p className="text-xs text-gray-400 mt-1">Panou Student</p>
                </div>

                <nav className="flex-1 px-4 space-y-4">
                    <button
                        onClick={() => setActiveTab('my-loans')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'my-loans' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        📚 Împrumuturile Mele
                    </button>
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all ${activeTab === 'catalog' ? 'neu-btn-inner text-[#6d5dfc] font-bold' : 'hover:bg-white/30'}`}
                    >
                        🔍 Catalog Cărți
                    </button>
                </nav>

                <div className="p-8">
                    <button onClick={logout} className="neu-btn neu-btn-danger w-full py-3">Delogare</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-10 h-screen overflow-y-auto w-full">

                {/* --- MY LOANS TAB --- */}
                {activeTab === 'my-loans' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-bold text-[#6d5dfc]">Împrumuturile Mele</h2>
                        </div>

                        {myLoans.length === 0 ? (
                            <p className="text-center p-10 text-gray-400">Nu ai niciun împrumut activ în acest moment.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myLoans.map(loan => (
                                    <div key={loan.id} className="neu-card p-4 flex gap-4 items-center">
                                        {loan.book?.image_url ? (
                                            <img src={getFileUrl(loan.book.image_url)} alt="Cover" className="w-20 h-28 object-cover rounded shadow shrink-0" />
                                        ) : (
                                            <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-[10px] shrink-0">No Cover</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 truncate" title={loan.book?.title}>{loan.book?.title}</h4>
                                            <p className="text-xs text-red-500 font-bold mb-3">Scadent: {new Date(loan.return_due_date).toLocaleDateString()}</p>

                                            <div className="flex flex-wrap gap-2">
                                                {loan.book?.pdf_path && (
                                                    <a
                                                        href={getFileUrl(loan.book.pdf_path)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={() => api.post(`/books/${loan.book.id}/read`)}
                                                        className="neu-btn px-3 py-2 text-[10px] text-white bg-[#6d5dfc]"
                                                    >
                                                        Citește
                                                    </a>
                                                )}
                                                <button onClick={() => handleReturn(loan.id)} className="neu-btn px-3 py-2 text-[10px] text-green-700">
                                                    Returnează
                                                </button>
                                                <button onClick={async () => {
                                                    showConfirm(
                                                        'Prelungești cu 7 zile?',
                                                        async () => {
                                                            try {
                                                                await api.put(`/loans/${loan.id}/extend`);
                                                                showAlert('Prelungit!', 'Succes');
                                                                fetchLoans();
                                                            } catch (e) { showAlert('Eroare', 'Eroare'); }
                                                        },
                                                        'Extindere Termen'
                                                    );
                                                }} className="neu-btn px-3 py-2 text-[10px] text-blue-600">
                                                    +7 Zile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- CATALOG TAB --- */}
                {activeTab === 'catalog' && (
                    <div className="animate-fade-in">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-[#6d5dfc] mb-6">Catalog Cărți Disponibile</h2>

                            <div className="w-full flex flex-col md:flex-row gap-4">
                                <input
                                    type="text"
                                    placeholder="Caută cărți după titlu sau ISBN..."
                                    className="neu-input text-lg flex-1 min-w-0"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                />
                                <select
                                    className="neu-input !w-32 text-sm py-2 text-center flex-none font-bold"
                                    value={limit === 10000 ? 'all' : limit}
                                    onChange={(e) => {
                                        setLimit(e.target.value === 'all' ? 10000 : Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    <option value={12}>12 / pag</option>
                                    <option value={24}>24 / pag</option>
                                    <option value={48}>48 / pag</option>
                                    <option value={100}>100 / pag</option>
                                    <option value="all">Toate</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredBooks
                                .slice((page - 1) * limit, page * limit)
                                .map(book => (
                                    <div key={book.id} className="neu-card p-6 flex flex-col items-center text-center relative transition hover:-translate-y-2">
                                        {book.image_url ? (
                                            <img src={getFileUrl(book.image_url)} alt="Cover" className="w-32 h-48 object-cover rounded-xl shadow-lg mb-4" />
                                        ) : (
                                            <div className="w-32 h-48 bg-[#e0e5ec] rounded-xl flex items-center justify-center text-gray-400 font-bold mb-4">
                                                No Cover
                                            </div>
                                        )}

                                        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 truncate w-full" title={book.title}>{book.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{book.author?.name || 'Autor Necunoscut'}</p>

                                        <div className="mt-auto w-full">
                                            <div className="flex justify-between text-xs text-gray-400 mb-4 px-2">
                                                <span>{book.category}</span>
                                                <span className={book.available_stock > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                                                    {book.pdf_path ? 'E-Book' : `Stoc: ${book.available_stock}`}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleLoan(book.id)}
                                                disabled={!book.pdf_path && book.available_stock <= 0}
                                                className={`neu-btn w-full py-2 text-sm font-bold ${(book.pdf_path || book.available_stock > 0) ? 'text-[#6d5dfc]' : 'opacity-50 cursor-not-allowed'}`}
                                            >
                                                {book.pdf_path ? 'Citește / Împrumută' : (book.available_stock > 0 ? 'Împrumută' : 'Stoc Epuizat')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Pagination Controls */}
                        {filteredBooks.length > limit && (
                            <div className="flex justify-center gap-4 mt-12 mb-8">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="neu-btn px-4 py-2 disabled:opacity-50"
                                >
                                    &laquo; Anterior
                                </button>
                                <span className="self-center font-bold text-gray-600">
                                    Pagina {page} din {Math.ceil(filteredBooks.length / limit)}
                                </span>
                                <button
                                    disabled={page >= Math.ceil(filteredBooks.length / limit)}
                                    onClick={() => setPage(p => p + 1)}
                                    className="neu-btn px-4 py-2 disabled:opacity-50"
                                >
                                    Următor &raquo;
                                </button>
                            </div>
                        )}

                        {filteredBooks.length === 0 && books.length > 0 && (
                            <div className="text-center text-gray-400 mt-20">
                                Nu am găsit cărți care să corespundă căutării.
                            </div>
                        )}
                        {books.length === 0 && (
                            <div className="text-center text-gray-400 mt-20">
                                Nu există cărți disponibile momentan.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
