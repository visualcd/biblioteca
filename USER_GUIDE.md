# Ghid de Utilizare - Biblioteca Virtuală

## Accesarea Platformei
Adresa: `http://localhost:5173` (Dezvoltare Locală)

## Roluri & Fluxuri de Lucru

### 1. Student / Profesor
**Scop**: Împrumutarea și citirea cărților.
1. **Înregistrare/Autentificare**: Folosiți email-ul pentru a primi un cod OTP.
2. **Panou de Control (Dashboard)**:
   - **Tab-ul Catalog**: Căutați cărți după titlu sau ISBN. Filtrați după Nume/Detalii/Credite (doar pentru Profesori).
   - **Tab-ul Împrumuturile Mele**: Vizualizați împrumuturile active.
3. **Împrumut**: Apăsați "Împrumută" pe o carte disponibilă.
4. **Citire**: Dacă este un E-Book, apăsați "Citește" pentru a deschide PDF-ul.
5. **Returnare**: Apăsați "Returnează" pentru a încheia un împrumut.

### 2. Autor
**Scop**: Publicarea cărților.
1. **Încărcare**: Navigați la "Adaugă Carte". Completați Titlul, ISBN-ul, Descrierea.
2. **Fișiere**: Încărcați Imaginea de Copertă (JPG/PNG) și Fișierul Cărții (PDF).
3. **Status**: Cărțile sunt inițial "În Așteptare" până la aprobarea de către un Bibliotecar.

### 3. Bibliotecar
**Scop**: Gestionarea inventarului bibliotecii.
1. **Aprobări**: Verificați secțiunea "Cărți în Așteptare".
2. **Revizuire**: Descărcați PDF-ul pentru a verifica conținutul.
3. **Acțiune**: Apăsați "Aprobă" sau "Respinge". Cărțile aprobate devin vizibile în Catalog.

### 4. Admin
**Scop**: Gestionarea utilizatorilor.
1. **Lista Utilizatori**: Vizualizați toți utilizatorii înregistrați.
2. **Căutare/Sortare**: Filtrați după Nume, Email sau Rol.
3. **Activare**: Dezactivați conturile suspecte sau reactivați-le.
4. **Creare Utilizator**: Adăugați manual roluri specifice dacă este necesar.

## Depanare
- **Nu primiți Email OTP?**: Verificați consola backend-ului (în modul dev, codul OTP este afișat în consolă).
- **Încărcarea a eșuat?**: Asigurați-vă că fișierele sunt sub limita de mărime (50MB pentru PDF).
