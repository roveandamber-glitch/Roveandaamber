# ZYRA — Haute Couture & Modern Luxury E-Commerce Platform

> **A full-stack, production-grade luxury fashion e-commerce web application featuring role-based authentication, real-time order tracking, dynamic product filtering, and an executive administration portal.**

---

## 📌 Executive Summary

**ZYRA** is a modern e-commerce platform designed for haute couture and bespoke apparel boutiques. Built with a **Next.js App Router frontend** and an **Express.js + SQLite REST API backend**, the platform bridges high-fashion aesthetics with rigorous software engineering standards.

### Key Highlights for Technical Evaluators:
- **Unified Role-Based Authentication**: A single login portal that dynamically routes users to either the customer boutique or the administrator dashboard based on verified JWT role claims, storing distinct `userToken` and `adminToken` keys.
- **Dynamic Catalog & Mobile-First UX**: Responsive 2-column mobile product grid with dual pop-up filter and sort modals, real-time live search with debounced backend queries, and size-specific inventory stock clamping.
- **End-to-End Fulfillment Tracking**: Interactive 3-stage visual delivery tracker (`Tailoring & Packing` $\rightarrow$ `In Transit via Express Courier` $\rightarrow$ `Delivered`) synced in real-time with customer orders.
- **Complete Management Portal**: Full CRUD interface for products, category taxonomy, inventory stock monitoring, and customer purchase analytics.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      Client Browser    │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │          Next.js 14 Frontend Application         │
                    │   (App Router, Tailwind CSS, AntD, Framer Motion)│
                    └─────────────────────────┬────────────────────────┘
                                              │ Axios REST Client
                                              │ (Auth Interceptors: userToken / adminToken)
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │            Node.js / Express.js API              │
                    │   (JWT Middleware, Controllers, Error Handlers)  │
                    └─────────────────────────┬────────────────────────┘
                                              │ SQL Queries (Promise-wrapped)
                                              ▼
                    ┌──────────────────────────────────────────────────┐
                    │               SQLite Relational Database         │
                    │   (Users, Products, Categories, Orders)          │
                    └──────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### **Frontend Architecture**
| Technology | Purpose |
| :--- | :--- |
| **Next.js 14 (App Router)** | Server and Client component rendering, dynamic routing (`/product/[id]`), optimized asset delivery. |
| **React 18** | Declarative UI state management, hooks (`useState`, `useEffect`, `useRef`). |
| **Tailwind CSS** | Custom luxury color palettes (`#F9F6F0`, `#1A1A1A`, `#EFE8DC`), responsive utility classes. |
| **Ant Design (AntD)** | Form handling, notification toasts, theme customization (`antdTheme`). |
| **Framer Motion** | Micro-interactions, animated modal flyouts, and layout transitions. |
| **Lucide React** | Clean, minimalist iconography. |

### **Backend Architecture**
| Technology | Purpose |
| :--- | :--- |
| **Node.js & Express.js** | Modular REST API routing, custom middleware architecture. |
| **SQLite3 (sqlite3)** | Embedded relational database with promisified async/await execution. |
| **JSON Web Tokens (JWT)** | Stateless role-based authorization (`admin` vs `user`). |
| **Bcrypt.js** | Cryptographic password hashing (10 salt rounds). |
| **Multer** | Multi-part form data processing and local media uploads. |
| **CORS** | Cross-Origin Resource Sharing configuration for decoupled dev environments. |

---

## ✨ Core Features & Functionality

### 1. 🛍️ Customer Experience
- **Editorial Hero Section**: High-definition luxury campaign layout with clean typography.
- **Product Catalog & Dual Popups**:
  - 2-column mobile grid layout.
  - Dedicated **[ Filter ]** modal: Category filters, price sliders, size pills (`S`, `M`, `L`, `XL`, `XXL`), and color pickers.
  - Dedicated **[ Sort ]** modal: Featured, Price (Low to High / High to Low), Alphabetical (A-Z / Z-A).
- **Interactive Search Flyout**: Debounced real-time search matching products instantly, with popular trending search chips (`Silk Maxi Dress`, `Trench Coat`, etc.).
- **Product Detail & Dynamic Size Stock**:
  - Size selection clamps allowable order quantity to exact inventory available for that specific size.
  - Out-of-stock sizes are disabled with visual indicators.
- **Order Placement & Auth Modal**: If an unauthenticated user attempts to checkout, an auth modal prompts login with auto-return navigation.
- **Visual Order Fulfillment Tracker (`/orders`)**: 3-stage animated progress line displaying real-time delivery status.
- **Customer Profile Section (`/profile`)**:
  - 2-column account dashboard.
  - Personal Details editor with **change-detection validation** (Save button is disabled if no edits exist).
  - Security & Password change form with current password verification and 6-character validation.

### 2. 👑 Administration Management Portal (`/admin`)
- **Dashboard Overview**: Real-time sales metrics, revenue totals, active order counts, and registered customer lists.
- **Product Management**: Add, update, and remove products with multi-size stock quantities and image attachments.
- **Category Hierarchy**: Create and manage fashion collection taxonomies.
- **Order Fulfillment Console**: Real-time order status updater (`Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered` $\rightarrow$ `Cancelled`).
- **Customer Analytics**: View all registered users and their lifetime purchase totals.

---

## 🔐 Authentication & Security Model

```
   ┌───────────────┐           POST /api/auth/login            ┌────────────────────┐
   │ Customer /    │ ────────────────────────────────────────> │ Express Auth Route │
   │ Administrator │                                           └─────────┬──────────┘
   └───────────────┘                                                     │
                                                                 Verify Credentials
                                                                 & Query User Role
                                                                         │
                                                                         ▼
   ┌───────────────────────────────────────────────────────────┐         │
   │ Returns JWT Token + User Object { id, name, email, role } │ <───────┘
   └─────────────────────────────┬─────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
      If Role == 'admin':             If Role == 'user':
      - Store 'adminToken'            - Store 'userToken'
      - Redirect to /admin            - Redirect to / or /profile
```

- **Separated Storage Keys**: Token separation prevents privilege escalation and enables clean session state handling.
- **Field-Level Exact Error Messages**: Distinguishes between non-existent emails and incorrect passwords with immediate input highlighting.

---

## 📡 REST API Reference

### **Authentication (`/api/auth`)**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login user or admin, returns JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |
| `PUT` | `/api/auth/profile` | Update profile name, phone, address | Bearer Token |
| `PUT` | `/api/auth/change-password`| Change user account password | Bearer Token |

### **Products & Categories (`/api/products`, `/api/categories`)**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all products (supports category/search query) | Public |
| `GET` | `/api/products/:id` | Retrieve single product details | Public |
| `POST` | `/api/products` | Create a new product | Admin Token |
| `PUT` | `/api/products/:id` | Update product details and stock | Admin Token |
| `DELETE`| `/api/products/:id` | Delete a product | Admin Token |
| `GET` | `/api/categories` | Retrieve all categories | Public |
| `POST` | `/api/categories` | Create a new category | Admin Token |

### **Orders (`/api/orders`)**
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Place a new order with selected size and quantity | User Token |
| `GET` | `/api/orders/my-orders` | Fetch orders placed by authenticated user | User Token |
| `GET` | `/api/orders/all` | Fetch all orders across platform | Admin Token |
| `PUT` | `/api/orders/:id/status`| Update fulfillment status (`Processing`/`Shipped`/`Delivered`) | Admin Token |

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)

### 1. Clone & Navigate to Project
```bash
cd zyra
```

### 2. Backend Server Setup
```bash
cd server
npm install
node server.js
```
> Server will initialize the SQLite database automatically and listen on `http://localhost:5000`.

### 3. Frontend Client Setup
In a separate terminal window:
```bash
cd client
npm install
npm run dev -- --webpack
```
> Client application will start and be available at `http://localhost:3000`.

---

## 🔑 Default Credentials for Testing

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@zyra.com` | `admin123` | Full Store & Order Management (`/admin`) |
| **Customer** | `aisha@example.com` | `user123` | Shopping, Orders & Profile (`/profile`) |

---

## 💡 Engineering Highlights for Discussion

1. **Relational Data Integrity with SQLite**:
   Implemented asynchronous database wrappers (`db.get`, `db.all`, `db.run`) on top of `sqlite3` to allow clean, non-blocking `async/await` patterns across controllers without heavy ORM overhead.
2. **Component Reusability & Token Customization**:
   Overrode default UI library styling using custom CSS variables and Ant Design tokens to maintain an editorial quiet-luxury aesthetic with zero generic primary colors.
3. **Decoupled Architecture**:
   The frontend communicates strictly over standard JSON REST APIs with token interceptors, making the client framework-agnostic and ready for cloud deployment (e.g., Vercel + Render/Railway/AWS).

---

## 📄 License & Attribution
Developed as a production-grade full-stack e-commerce project demonstration. All rights reserved.
