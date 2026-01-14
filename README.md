# 📚 Manager Bibliotecă Virtuală

> Un sistem modern de gestiune a bibliotecii, full-stack, având o interfață cu **Design Neumorphic** și **Control al Accesului Bazat pe Roluri (RBAC)**.

![Interfață Neumorphism](frontend/public/logo.png)

## 🌟 Funcționalități

- **🎨 Interfață Neumorphic**: O estetică de design "soft plastic" pentru o experiență de utilizare premium.
- **🔐 Control al Accesului (RBAC)**: Panouri și permisiuni distincte pentru **Studenți**, **Profesori**, **Autori**, **Bibliotecari** și **Administratori**.
- **📖 Citire E-Book**: Vizualizator PDF integrat pentru împrumuturi digitale.
- **🔄 Managementul Împrumuturilor**: Ciclu complet pentru împrumutarea, returnarea și prelungirea cărților.
- **🔒 Autentificare Securizată**: Sistem de login bazat pe OTP (Parolă Unică) trimis prin email.
- **📊 Panou de Bord în Timp Real**: Statistici live și actualizări de status.

## 🛠️ Stack Tehnologic

### Frontend
- **Framework**: React 19 (Vite)
- **Stilizare**: Tailwind CSS v4 (Configurare Personalizată Neumorphism)
- **State Management**: Context API
- **Testare**: Vitest, React Testing Library

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Bază de date**: PostgreSQL
- **ORM**: Sequelize
- **Testare**: Jest, Supertest

## 🚀 Ghid de Pornire

### Cerințe Preliminare
- Node.js (v18+)
- PostgreSQL instalat și rulând local.

### Instalare

1.  **Clonează repository-ul**
    ```bash
    git clone https://github.com/numele-tau/virtual-library.git
    cd virtual-library
    ```

2.  **Configurare Backend**
    Navighează în folderul backend și instalează dependențele:
    ```bash
    cd backend
    npm install
    ```

    **Configurare Bază de Date:**
    Oferim un script interactiv pentru a configura automat baza de date și variabilele de mediu.
    ```bash
    node setup_database.js
    ```
    *Urmează instrucțiunile de pe ecran pentru a introduce credențialele PostgreSQL.*

    Pornește serverul:
    ```bash
    npm start
    ```

3.  **Configurare Frontend**
    Deschide un terminal nou, navighează în folderul frontend:
    ```bash
    cd ../frontend
    npm install
    ```

    Pornește serverul de dezvoltare:
    ```bash
    npm run dev
    ```

4.  **Accesează Aplicația**
    Deschide [http://localhost:5173](http://localhost:5173) în browserul tău.

## 🧪 Rulare Teste

Avem acoperire completă de teste pentru ambele părți ale stack-ului.

**Teste de Integrare Backend:**
```bash
cd backend
npm test
```

**Teste Componente Frontend:**
```bash
cd frontend
npm test
```

## 📖 Documentație

Documentația detaliată este disponibilă în repository:
- [Prezentare Arhitectură](ARCHITECTURE.md) ([RO](ARCHITECTURE_RO.md))
- [Ghid de Utilizare](USER_GUIDE.md) ([RO](USER_GUIDE_RO.md))

## 📄 Licență

Acest proiect este licențiat sub Licența MIT - vezi fișierul [LICENSE](LICENSE) pentru detalii.
