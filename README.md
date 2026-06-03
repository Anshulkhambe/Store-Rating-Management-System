# Store Rating Management System

A premium, full-stack Web Application that allows users to register, search registered stores, and submit or modify ratings (ranging from 1 to 5 stars). The system features a unified single login system that routes users to custom panels based on their system roles: **System Administrators**, **Store Owners**, and **Normal Customers**.

Built with a modern **Glassmorphic Dark Space Theme** using Vanilla CSS, complete with micro-interactions, responsive grids, and real-time validation gauges.

---

## 🚀 Tech Stack

- **Backend**: ExpressJS, Sequelize ORM, JWT, BcryptJS, Dotenv
- **Frontend**: ReactJS (Vite v5), Axios, Lucide Icons
- **Database**: MySQL Server 8.0 (Auto-verifying & creation)
- **Styling**: Custom Vanilla CSS (No framework dependencies)

---

## 📊 Database Schema Design

The system runs on two primary relational tables:

### 1. `users` Table
Stores authentication details, address information, and system roles.
- `id` (INT, Auto Increment, Primary Key)
- `name` (VARCHAR(60), Min 20 characters limit)
- `email` (VARCHAR(255), Unique, standard email format)
- `password` (VARCHAR(255), Encrypted with Bcrypt)
- `address` (VARCHAR(400), Max 400 characters limit)
- `role` (ENUM('admin', 'user', 'store_owner'))

### 2. `ratings` Table
Stores rating transactions with a composite unique index on `(userId, storeId)` to prevent duplicate votes while permitting modification.
- `id` (INT, Auto Increment, Primary Key)
- `userId` (INT, Foreign Key referencing `users(id)`, Cascade on delete)
- `storeId` (INT, Foreign Key referencing `users(id)`, Cascade on delete)
- `rating` (INT, range 1 to 5)

---

## 🔒 Form Validations

Both frontend forms and backend validation middlewares strictly enforce the following rules:
- **Full Name**: Minimum 20 characters, Maximum 60 characters. *(Registration UI provides a dynamic visual validation progress bar to help users meet the minimum length).*
- **Address**: Maximum 400 characters.
- **Password**: 8-16 characters, must include at least one uppercase letter and one special character (e.g. `@`, `$`, `#`, `!`).
- **Email**: Validated against standard RFC email patterns.

---

## 🔑 Pre-Seeded Test Credentials

To ease the review process, a seeder script initializes the database with the following accounts.
All seeded accounts use the password: **`Password123!`**

| System Role | Email Address | Seeded Account Name | Capabilities |
|---|---|---|---|
| **System Administrator** | `admin@storerating.com` | `System Administrator User` | Monitor totals, register new users, sort/filter all stores and users, inspect details. |
| **Normal User 1** | `user1@storerating.com` | `Normal Customer Account One` | Browse stores, search by name/address, rate stores (1-5), modify ratings. |
| **Normal User 2** | `user2@storerating.com` | `Normal Customer Account Two` | Browse stores, search/sort, submit/modify ratings, update password. |
| **Store Owner 1** | `owner1@storerating.com` | `The Big Apple Shopping Store` | Check average rating index, view detailed voter list, update password. |
| **Store Owner 2** | `owner2@storerating.com` | `Green Supermarket International` | Check average rating index, view detailed voter list, update password. |
| **Store Owner 3** | `owner3@storerating.com` | `Tech Gadget Depot Hub Store` | Check average rating index, view detailed voter list, update password. |

---

## 🛠️ Installation & Setup

Ensure you have [Node.js (v20.17+)](https://nodejs.org/) and a running [MySQL Server](https://www.mysql.com/) database.

### 1. Backend Configuration
1. Open the `/backend` folder:
   ```bash
   cd backend
   ```
2. Configure the environment variables in `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD="your_mysql_password_here"
   DB_NAME=store_rating_db
   JWT_SECRET=super_secret_store_rating_key_12345
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database (this will automatically verify connection, create `store_rating_db` if missing, construct schemas, and load initial data):
   ```bash
   npm run seed
   ```
5. Start the API server:
   ```bash
   npm run dev
   ```
   *(Running locally on http://localhost:5000)*

### 2. Frontend Configuration
1. Open the `/frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client dev server:
   ```bash
   npm run dev
   ```
   *(Running locally on http://localhost:5173)*

---

## 📡 API Documentation

All routes expect JSON payloads. Authenticated routes require standard Bearer authorization headers: `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints
- `POST /api/auth/register`: Register a new Customer.
- `POST /api/auth/login`: Unified login endpoint. Returns user profile details and JWT token.
- `GET /api/auth/me` *(Auth Required)*: Fetch profile details for active token validation.
- `PUT /api/auth/password` *(Auth Required)*: Update the current user's password.

### Admin-Only Endpoints *(Admin Guard)*
- `GET /api/admin/dashboard`: Returns aggregate stats: `totalUsers`, `totalStores`, `totalRatings`.
- `POST /api/admin/users`: Creates any user role (Admin, User, Store Owner).
- `GET /api/admin/users`: Filterable/sortable listing of Admins and Customers.
- `GET /api/admin/stores`: Filterable/sortable listing of Store Owners with calculated ratings.
- `GET /api/admin/users/:id`: Details for a specific profile (fetches reputation score if role is store owner).

### Store & Rating Endpoints
- `GET /api/stores/list` *(Customer Guard)*: Filterable/sortable directory of registered stores, overall averages, and current user's submitted rating value.
- `POST /api/stores/rate` *(Customer Guard)*: Submit a new rating or modify an existing rating (integer range 1 to 5).
- `GET /api/stores/dashboard` *(Store Owner Guard)*: Fetches average reputation score and reviews history log.

---

## 🔓 How to Make this GitHub Repository Public
If your GitHub repository is currently private, please follow these steps to make it public for review:
1. Navigate to your repository page: https://github.com/Anshulkhambe/Store-Rating-Management-System
2. Click on the **Settings** tab located below the repository name header.
3. Scroll down to the bottom of the page to the **Danger Zone** section.
4. Click on the **Change visibility** button next to *Change repository visibility*.
5. Select **Make public**.
6. Follow the security instructions (type the repository name or confirm password) to approve the change.
