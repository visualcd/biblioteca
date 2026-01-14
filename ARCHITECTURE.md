# Arhitectura Sistemului - Biblioteca Virtuală

## Imagine de Ansamblu
Managerul de Bibliotecă Virtuală este o aplicație web full-stack proiectată pentru gestionarea cărților, împrumuturilor și administrarea utilizatorilor. Arhitectura este de tip client-server, cu o separare clară a responsabilităților.

### Tehnologii Utilizate
- **Frontend**: React 19, Vite, Tailwind CSS v4.
- **Backend**: Node.js, Express.js.
- **Bază de date**: PostgreSQL (prin Sequelize ORM).
- **Autentificare**: JWT & OTP (Bazată pe Email).

## Structura Directoarelor

### `/backend`
- **`config/`**: Configurația bazei de date (`database.js`).
- **`controllers/`**: Logica pentru procesarea cererilor (`authController`, `bookController`, `loanController`).
- **`models/`**: Definițiile Sequelize (`User`, `Book`, `Loan`).
- **`routes/`**: Definițiile endpoint-urilor API.
- **`middleware/`**: Verificarea autentificării și a rolurilor (`authMiddleware.js`).
- **`tests/`**: Teste de integrare Jest.

### `/frontend`
- **`src/context/`**: Starea globală (`AuthContext`, `ModalContext`).
- **`src/pages/`**: Dashboard-uri specifice rolurilor (`Student`, `Professor`, `Author`, `Librarian`, `Admin`).
- **`src/services/`**: Instanța Axios pentru comunicarea cu API-ul.
- **`src/tests/`**: Teste de componente Vitest.

## Modele de Proiectare Cheie
1. **Neumorphism**: Interfața utilizează o estetică "soft", plastică, realizată prin manipularea umbrelor în CSS.
2. **Context API**: Utilizat pentru gestionarea stării globale de Autentificare și a Modalelor, evitând "prop drilling".
3. **Role-Based Access Control (RBAC)**: Middleware-ul din backend impune strict rolurile (ex: doar Adminul/Bibliotecarul poate aproba cărți).

## Schema Bazei de Date
- **Users**: Stochează credențiale, roluri și status (activ/inactiv).
- **Books**: Stochează metadate, căi către PDF, URL-uri pentru coperți și stocul disponibil.
- **Loans**: Tabela de legătură între Utilizatori și Cărți, urmărind datele scadente și statusul.
