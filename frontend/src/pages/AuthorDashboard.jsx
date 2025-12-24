import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const AuthorDashboard = () => {
    const { logout, user } = useAuth();
    const { showConfirm, showAlert } = useModal();
    const [books, setBooks] = useState([]);
    const [stats, setStats] = useState({ views: 0, downloads: 0, loans: 0 });
    // ... (skipping unchanged)

    // ... inside return ...
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="neu-card p-6 text-center">
            <h3 className="text-3xl font-bold text-[#6d5dfc] mb-2">{stats.views}</h3>
            <p className="font-semibold text-gray-500">Vizualizări Totale</p>
        </div>
        <div className="neu-card p-6 text-center">
            <h3 className="text-3xl font-bold text-[#6d5dfc] mb-2">{stats.downloads}</h3>
            <p className="font-semibold text-gray-500">Descărcări / Lecturi</p>
        </div>
        <div className="neu-card p-6 text-center">
            <h3 className="text-3xl font-bold text-[#6d5dfc] mb-2">{stats.loans}</h3>
            <p className="font-semibold text-gray-500">Împrumuturi Totale</p>
        </div>
    </div>
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        category: '',
        description: '',
        publisher: '',
        publication_year: '',
        edition: '', // Volume/Edition
        total_stock: 1,
        cover: null,
        bookFile: null
    });

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [search, setSearch] = useState('');

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books/my-books');
            setBooks(res.data);

            // Calc stats
            const loans = res.data.reduce((acc, b) => acc + (parseInt(b.loan_count) || 0), 0);
            setStats({ loans });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        (book.isbn && book.isbn.includes(search))
    );

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        // IMPORTANT: Append text fields FIRST so multer can access req.body.isbn in file storage engine
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && key !== 'cover' && key !== 'bookFile') {
                data.append(key, formData[key]);
            }
        });
        // Append files LAST
        if (formData.cover) data.append('cover', formData.cover);
        if (formData.bookFile) data.append('bookFile', formData.bookFile);

        try {
            if (editMode) {
                await api.put(`/books/${editId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showAlert('Carte actualizată!', 'Succes');
            } else {
                await api.post('/books', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showAlert('Carte trimisă spre aprobare!', 'Succes');
            }
            setShowForm(false);
            setEditMode(false);
            setFormData({
                title: '', isbn: '', category: '', description: '',
                publisher: '', publication_year: '', edition: '',
                total_stock: 1, cover: null, bookFile: null
            });
            fetchBooks();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Eroare', 'Eroare');
            console.error(err);
        }
    };

    const handleEdit = (book) => {
        setEditMode(true);
        setEditId(book.id);
        setFormData({
            title: book.title,
            isbn: book.isbn || '',
            category: book.category || '',
            description: book.description || '',
            publisher: book.publisher || '',
            publication_year: book.publication_year || '',
            edition: book.edition || '',
            total_stock: book.total_stock,
            cover: null, // Don't prepopulate files
            bookFile: null
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        showConfirm(
            'Sigur vrei să ștergi această carte?',
            async () => {
                try {
                    await api.delete(`/books/${id}`);
                    fetchBooks();
                } catch (err) { showAlert('Eroare la ștergere', 'Eroare'); }
            },
            'Ștergere Carte'
        );
    };

    const handleRetract = async (book) => {
        showConfirm(
            'Ești sigur că vrei să retragi cartea? Ea nu va mai fi vizibilă publicului.',
            async () => {
                try {
                    await api.put(`/books/${book.id}`, { status: 'draft' });
                    showAlert('Cartea a fost retrasă (setată ca draft).', 'Succes');
                    fetchBooks();
                } catch (err) {
                    showAlert('Eroare la retragere', 'Eroare');
                    console.error(err);
                }
            },
            'Retragere Carte'
        );
    };

    // Helper to fix paths
    const getFileUrl = (path) => {
        if (!path) return null;
        return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
    };

    if (showForm) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#e0e5ec] text-[#4a5568]">
                <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-8 left-8 neu-btn px-6 py-2"
                >
                    Înapoi
                </button>
                <div className="neu-card p-8 w-full max-w-2xl">
                    <h2 className="text-3xl font-bold mb-6 text-center text-[#6d5dfc]">
                        {editMode ? 'Editează Carte' : 'Adaugă Carte Nouă'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Titlu</label>
                                <input className="neu-input" required
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Autor</label>
                                <input className="neu-input opacity-70 cursor-not-allowed"
                                    value={user?.name || 'Eu'} readOnly />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">ISBN</label>
                                <input className="neu-input"
                                    value={formData.isbn} onChange={e => setFormData({ ...formData, isbn: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Categorie</label>
                                <select
                                    className="neu-input"
                                    required
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">— Selectează categoria —</option>

                                    <optgroup label="Literatură (General)">
                                        <option>Literatură universală</option>
                                        <option>Literatură română</option>
                                        <option>Literatură contemporană</option>
                                        <option>Literatură clasică</option>
                                        <option>Proză</option>
                                        <option>Poezie</option>
                                        <option>Dramaturgie</option>
                                        <option>Eseuri literare</option>
                                        <option>Memorii și jurnale</option>
                                        <option>Epistolar</option>
                                    </optgroup>

                                    <optgroup label="Ficțiune">
                                        <option>Ficțiune literară</option>
                                        <option>Ficțiune istorică</option>
                                        <option>Ficțiune contemporană</option>
                                        <option>Ficțiune psihologică</option>
                                        <option>Ficțiune filozofică</option>
                                        <option>Ficțiune politică</option>
                                        <option>Ficțiune satirică</option>
                                        <option>Ficțiune alegorică</option>
                                    </optgroup>

                                    <optgroup label="Science Fiction & Fantasy">
                                        <option>Science Fiction</option>
                                        <option>Hard Science Fiction</option>
                                        <option>Space Opera</option>
                                        <option>Cyberpunk</option>
                                        <option>Steampunk</option>
                                        <option>Dystopian / Utopian</option>
                                        <option>Post-apocaliptic</option>
                                        <option>Fantasy</option>
                                        <option>High Fantasy</option>
                                        <option>Urban Fantasy</option>
                                        <option>Dark Fantasy</option>
                                        <option>Mitologie</option>
                                    </optgroup>

                                    <optgroup label="Mister, Crimă & Thriller">
                                        <option>Mister</option>
                                        <option>Roman polițist</option>
                                        <option>Roman detectivistic</option>
                                        <option>Crime Fiction</option>
                                        <option>Thriller</option>
                                        <option>Thriller psihologic</option>
                                        <option>Thriller politic</option>
                                        <option>Thriller juridic</option>
                                        <option>Noir</option>
                                        <option>True Crime</option>
                                    </optgroup>

                                    <optgroup label="Horror & Gothic">
                                        <option>Horror</option>
                                        <option>Horror psihologic</option>
                                        <option>Horror supranatural</option>
                                        <option>Horror cosmic</option>
                                        <option>Gothic</option>
                                        <option>Dark Fiction</option>
                                    </optgroup>

                                    <optgroup label="Romantic & Relații">
                                        <option>Roman de dragoste</option>
                                        <option>Romantic contemporan</option>
                                        <option>Romantic istoric</option>
                                        <option>Young Adult Romance</option>
                                        <option>Dramă romantică</option>
                                        <option>Erotic (18+)</option>
                                    </optgroup>

                                    <optgroup label="Copii & Young Adult">
                                        <option>Literatură pentru copii</option>
                                        <option>Cărți ilustrate</option>
                                        <option>Basme și povești</option>
                                        <option>Young Adult</option>
                                        <option>Middle Grade</option>
                                        <option>Aventură pentru tineri</option>
                                    </optgroup>

                                    <optgroup label="Non-Ficțiune">
                                        <option>Biografii</option>
                                        <option>Autobiografii</option>
                                        <option>Memorii</option>
                                        <option>Eseuri</option>
                                        <option>Istorie</option>
                                        <option>Istorie românească</option>
                                        <option>Geopolitică</option>
                                        <option>Sociologie</option>
                                        <option>Antropologie</option>
                                    </optgroup>

                                    <optgroup label="Știință & Tehnologie">
                                        <option>Știință</option>
                                        <option>Popularizare științifică</option>
                                        <option>Matematică</option>
                                        <option>Informatică</option>
                                        <option>Inteligență artificială</option>
                                        <option>Securitate informatică</option>
                                        <option>Criptografie</option>
                                        <option>Inginerie</option>
                                        <option>Astronomie</option>
                                    </optgroup>

                                    <optgroup label="Educație & Academice">
                                        <option>Manuale școlare</option>
                                        <option>Manuale universitare</option>
                                        <option>Cursuri</option>
                                        <option>Lucrări academice</option>
                                        <option>Cercetare științifică</option>
                                    </optgroup>

                                    <optgroup label="Psihologie & Dezvoltare Personală">
                                        <option>Psihologie</option>
                                        <option>Psihologie clinică</option>
                                        <option>Psihologie cognitivă</option>
                                        <option>Dezvoltare personală</option>
                                        <option>Inteligență emoțională</option>
                                        <option>Leadership</option>
                                    </optgroup>

                                    <optgroup label="Filosofie & Religie">
                                        <option>Filosofie</option>
                                        <option>Etică</option>
                                        <option>Logică</option>
                                        <option>Metafizică</option>
                                        <option>Religie</option>
                                        <option>Teologie</option>
                                        <option>Spiritualitate</option>
                                    </optgroup>

                                    <optgroup label="Economie, Afaceri & Drept">
                                        <option>Economie</option>
                                        <option>Finanțe</option>
                                        <option>Investiții</option>
                                        <option>Antreprenoriat</option>
                                        <option>Management</option>
                                        <option>Marketing</option>
                                        <option>Drept</option>
                                        <option>Drept civil</option>
                                        <option>Drept penal</option>
                                    </optgroup>

                                    <optgroup label="Artă, Cultură & Media">
                                        <option>Artă</option>
                                        <option>Istoria artei</option>
                                        <option>Design</option>
                                        <option>Arhitectură</option>
                                        <option>Fotografie</option>
                                        <option>Film</option>
                                        <option>Muzică</option>
                                    </optgroup>

                                    <optgroup label="Lifestyle & Hobby">
                                        <option>Călătorii</option>
                                        <option>Gastronomie</option>
                                        <option>Sănătate</option>
                                        <option>Sport</option>
                                        <option>DIY</option>
                                        <option>Automobile</option>
                                    </optgroup>

                                    <optgroup label="Benzi desenate & Vizual">
                                        <option>Benzi desenate</option>
                                        <option>Graphic Novel</option>
                                        <option>Manga</option>
                                        <option>Webtoon</option>
                                        <option>Artbooks</option>
                                    </optgroup>

                                    <optgroup label="Autori Români">
                                        <option>Autori români – clasici</option>
                                        <option>Autori români – contemporani</option>
                                        <option>Proză românească</option>
                                        <option>Poezie românească</option>
                                        <option>Dramaturgie românească</option>
                                        <option>Eseu românesc</option>
                                        <option>Literatură română interbelică</option>
                                        <option>Literatură română post-1989</option>
                                    </optgroup>

                                    <optgroup label="Limbi & Filologie">
                                        <option>Lingvistică</option>
                                        <option>Filologie</option>
                                        <option>Dicționare</option>
                                        <option>Traduceri</option>
                                        <option>Limbi străine</option>
                                    </optgroup>

                                    <optgroup label="Diverse & Specializate">
                                        <option>Cărți rare</option>
                                        <option>Manuscrise</option>
                                        <option>Documente istorice</option>
                                        <option>Publicații tehnice</option>
                                        <option>Rapoarte</option>
                                        <option>Studii de caz</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Stoc Fizic</label>
                                <input type="number" min="0" className="neu-input"
                                    value={formData.total_stock} onChange={e => setFormData({ ...formData, total_stock: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Editura</label>
                                <input className="neu-input"
                                    value={formData.publisher} onChange={e => setFormData({ ...formData, publisher: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">An</label>
                                <input type="number" className="neu-input" required
                                    value={formData.publication_year} onChange={e => setFormData({ ...formData, publication_year: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Volum</label>
                                <input className="neu-input"
                                    value={formData.edition} onChange={e => setFormData({ ...formData, edition: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 ml-1">Descriere</label>
                            <textarea className="neu-input h-24"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">Copertă</label>
                                <input type="file" name="cover" accept="image/jpeg, image/png, image/gif, image/webp, image/avif" onChange={handleFileChange}
                                    className="neu-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#6d5dfc] file:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 ml-1">PDF / EPUB</label>
                                <input type="file" name="bookFile" accept=".pdf,.epub" onChange={handleFileChange}
                                    className="neu-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#6d5dfc] file:text-white" />
                            </div>
                        </div>

                        <button className="neu-btn neu-btn-primary w-full py-4 mt-6">
                            {editMode ? 'Salvează Modificările' : 'Publică Cartea'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const getGreeting = () => {
        if (!user?.name) return 'Bună, Autor';
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
        return `Bună, ${firstName} ${lastInitial}`;
    };

    return (
        <div className="min-h-screen p-10 bg-[#e0e5ec] text-[#4a5568]">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-[#6d5dfc]">
                        {getGreeting()}
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 text-lg">
                        Total Împrumuturi: <span className="text-[#6d5dfc]">{stats.loans}</span> 📚
                    </p>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => {
                        setEditMode(false); setFormData({
                            title: '', isbn: '', category: '', description: '',
                            publisher: '', publication_year: '', edition: '',
                            total_stock: 1, cover: null, bookFile: null
                        }); setShowForm(true);
                    }}
                        className="neu-btn px-6 py-2 text-[#6d5dfc]">
                        + Adaugă Carte
                    </button>
                    <button onClick={logout} className="neu-btn neu-btn-danger px-6 py-2">Delogare</button>
                </div>
            </div>

            {/* Stats Cards REMOVED as requested */}

            <h2 className="text-2xl font-bold text-gray-700 mb-6 border-l-4 border-[#6d5dfc] pl-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="shrink-0">Cărțile Mele</span>
                <div className="flex gap-4 w-full md:w-auto items-center flex-1 md:justify-end">
                    <input
                        type="text"
                        placeholder="Caută în cărțile mele..."
                        className="neu-input py-1 px-4 text-sm w-full md:w-96"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <select
                        className="neu-input !w-24 text-sm py-1 font-bold text-center shrink-0"
                        value={limit === 10000 ? 'all' : limit}
                        onChange={(e) => {
                            setLimit(e.target.value === 'all' ? 10000 : Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                        <option value={100}>100</option>
                        <option value="all">Tot</option>
                    </select>
                </div>
            </h2>

            {books.length === 0 ? (
                <p className="text-gray-500">Nu ai adăugat nicio carte încă.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredBooks.slice((page - 1) * limit, page * limit).map(book => (
                            <div key={book.id} className="neu-card p-4 flex flex-col relative transition hover:-translate-y-1">
                                <div className="flex gap-4">
                                    {book.image_url ? (
                                        <img src={getFileUrl(book.image_url)} alt="Cover" className="w-24 h-36 object-cover rounded shadow-md shrink-0" />
                                    ) : (
                                        <div className="w-24 h-36 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400 shrink-0">No Cover</div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight truncate" title={book.title}>{book.title}</h3>
                                            <p className="text-xs text-gray-500 mb-1">{book.category}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${book.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {book.status === 'published' ? 'Publicat' : 'Draft'}
                                            </span>
                                        </div>

                                        <div className="text-xs text-gray-400 font-bold mt-2">
                                            📚 {book.loan_count || 0} Împrumuturi
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(book)} className="neu-btn px-4 py-2 text-xs flex-1">
                                            Editează
                                        </button>
                                        {book.status === 'published' ? (
                                            <button onClick={() => handleRetract(book)} className="neu-btn text-yellow-600 px-4 py-2 text-xs flex-1">
                                                Dezactivează
                                            </button>
                                        ) : (
                                            <button onClick={() => handleDelete(book.id)} className="neu-btn neu-btn-danger px-4 py-2 text-xs flex-1">
                                                Șterge
                                            </button>
                                        )}
                                    </div>
                                    {book.book_file_path && (
                                        <a
                                            href={getFileUrl(book.book_file_path)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-[#6d5dfc] text-center underline"
                                        >
                                            Vezi PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {filteredBooks.length > limit && (
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="neu-btn px-4 py-2 disabled:opacity-50"
                            >
                                « Anterior
                            </button>
                            <span className="self-center font-bold text-gray-600">
                                Pagina {page} din {Math.ceil(filteredBooks.length / limit)}
                            </span>
                            <button
                                disabled={page >= Math.ceil(filteredBooks.length / limit)}
                                onClick={() => setPage(p => p + 1)}
                                className="neu-btn px-4 py-2 disabled:opacity-50"
                            >
                                Următor »
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AuthorDashboard;
