# User Guide - Virtual Library

## Accessing the Platform
Address: `http://localhost:5173` (Local Development)

## Roles & Workflows

### 1. Student / Professor
**Goal**: Borrow and read books.
1. **Register/Login**: Use email to receive an OTP.
2. **Dashboard**:
   - **Catalog Tab**: Search for books by title or ISBN. Filter by Name/Details/Credits (Professor only).
   - **My Loans Tab**: View active loans.
3. **Borrowing**: Click "Împrumutăm" on a book availability.
4. **Reading**: If an E-Book, click "Citește" to open the PDF.
5. **Returning**: Click "Returnează" to end a loan.

### 2. Author
**Goal**: Publish books.
1. **Upload**: Navigate to "Book Upload". Fill in Title, ISBN, Description.
2. **Files**: Upload Cover Image (JPG/PNG) and Book File (PDF).
3. **Status**: Books are initially "Pending" until approved by a Librarian.

### 3. Librarian
**Goal**: Manage library inventory.
1. **Approvals**: Check "Cărți în Așteptare".
2. **Review**: Download the PDF to verify content.
3. **Action**: Click "Aprobă" or "Respinge". Approved books become visible in the Catalog.

### 4. Admin
**Goal**: Manage users.
1. **User List**: View all registered users.
2. **Search/Sort**: Filter by Name, Email, or Role.
3. **Activation**: Deactivate suspicious accounts or reactivate them.
4. **Create User**: Manually add specific roles if needed.

## Troubleshooting
- **No Email OTP?**: Check the backend console logic (in dev mode, OTP is logged).
- **Upload Failed?**: Ensure files are under the size limit (50MB for PDF).
