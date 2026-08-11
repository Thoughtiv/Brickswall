# 🏗️ Bricks Wall - Full-Stack Construction Platform

Welcome to the **Bricks Wall** project repository. This document serves as the complete technical architecture guide and onboarding documentation for developers working on the platform.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Directory Structure](#-project-directory-structure)
4. [Core Features Breakdown](#-core-features-breakdown)
5. [Local Development Setup](#-local-development-setup)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Upcoming Roadmap & Planned Email Quotation Feature](#-upcoming-roadmap--planned-email-quotation-feature)

---

## 🚀 Project Overview
**Bricks Wall** is a premier full-stack web application designed for a leading construction and engineering firm in Hyderabad. The platform provides clients with transparent construction cost estimation, project portfolio galleries, package comparisons, and blog guides, supported by a full-fledged Administrative Content Management System (CMS) for managing live content without code edits.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework**: React 18 (Vite)
* **Styling**: Custom CSS System (`App.css`), Tailwind CSS (`index.css`), HSL Color Tokens
* **Iconography**: Lucide React Icons
* **HTTP Client**: Native Fetch API / Axios helper (`src/utils/api.js`)

### **Backend**
* **Runtime**: Node.js (ES Modules `import/export`)
* **Framework**: Express.js
* **Database**: MySQL 8.0 with `mysql2/promise` connection pooling
* **File Processing**: Base64 File Uploader Route (`/api/upload`)
* **CORS Management**: Configured for local development (`localhost:5173`, `3000`) & production hosting

---

## 📂 Project Directory Structure

```
thoughtiv/
├── brickswall/                # Frontend React Application (Vite)
│   ├── public/                # Static images, brand logos, favicons
│   ├── src/
│   │   ├── components/        # Header, Footer, Chatbot, UploadFile, EstimateModal
│   │   ├── pages/             # Home, Services, Projects, Packages, AboutUs, Blog, Contact, AdminDashboard
│   │   ├── utils/             # api.js (Backend API integration helpers)
│   │   ├── App.jsx            # Application Router & Global State
│   │   ├── App.css            # Primary design tokens & CSS system
│   │   └── index.css          # Tailwind CSS base and utility directives
│   ├── .env                   # Frontend Environment Variables
│   └── package.json           # Frontend dependencies & Vite scripts
│
└── server/                    # Backend Express API Server
    ├── models/                # schema.js (MySQL table initialization & seed data)
    ├── routes/                # Express API Route Handlers (blogs.js, pricing.js, upload.js, etc.)
    ├── .env                   # Server Environment Variables (Port, DB credentials, CORS)
    ├── server.js              # Server entry point & global middleware
    └── package.json           # Server dependencies & Node scripts
```

---

## ✨ Core Features Breakdown

### **1. Public User Experience**
* **Responsive Header & Navigation**:
  * High-resolution brand logo scaled appropriately for desktop (`130px`) and mobile (`92px`).
  * Context-aware CTA button displaying `[ 👤 Request Free Estimate ]` on desktop and compact `[ 👤 Estimate ]` on mobile.
  * Mobile slide-over drawer menu with quick call integration.
* **Interactive Hero & Statistics**:
  * Highlighted trust badges: **"We Provide Warranty"** and **"Premium Quality Materials"**.
  * Responsive stats grid: `15+ Years Exp`, `50+ Projects Handover`, `100% Transparent Pricing`.
* **Service Categories Ribbon**:
  * Flexible grid layout covering **Residential Homes**, **Luxury Villas**, **Commercial Buildings**, **Schools & Institutions**, and **Renovation & Remodeling**.
* **Filterable Project Portfolio**:
  * Categorized project gallery (Independent Homes, Luxury Villas, Commercial, Schools) with interactive detail modals.
* **Construction Package Comparison Matrix**:
  * Detailed specification breakdown (Basic ₹1,850/sq.ft, Premium ₹2,150/sq.ft, Luxury ₹2,750/sq.ft) covering cement grade, steel quality, warranty, and flooring.
* **Blog & Knowledge Hub**:
  * Dynamic blog reader with categories, estimated reading times, and construction advice.
* **Contact & Estimate Booking**:
  * Full inquiry submission form connected to backend MySQL storage.
  * Interactive Google Maps integration covering Hyderabad service regions (Jubilee Hills, Gachibowli, Tellapur, Kukatpally, etc.).

### **2. Admin CMS Dashboard (`AdminDashboard.jsx`)**
* **Project Manager**: Add, edit, or remove portfolio projects with direct image file upload support.
* **Blog CRUD Manager**: Create, edit, publish/unpublish, and delete articles with custom image upload capabilities.
* **Package Matrix Editor**: Real-time editable matrix table allowing administrators to change rates per sq.ft and specifications dynamically.
* **Universal File Uploader (`UploadFile.jsx`)**: Replaces external image URL requirements with local Base64/file upload handling via `/api/upload`.
* **Inquiries Inbox**: Real-time inbox for reviewing customer estimate requests and direct messages.

---

## 💻 Local Development Setup

Follow these steps to run the complete stack locally on your machine.

### **1. Prerequisites**
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MySQL**: Local MySQL instance or Docker Desktop

---

### **2. Database Setup (Docker Recommended)**
Run a local MySQL instance using Docker:
```bash
docker run --name brickswall-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=brickswall_db \
  -e MYSQL_USER=u831422133_brickswall \
  -e MYSQL_PASSWORD=your_db_password \
  -p 3306:3306 -d mysql:latest
```

---

### **3. Backend Server Setup**
1. Navigate to the `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file inside `server/`:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=u831422133_brickswall
   DB_PASSWORD=your_db_password
   DB_NAME=brickswall_db
   FRONTEND_URL=http://localhost:5173,http://localhost:3000
   ```
3. Start the Express backend server:
   ```bash
   npm run dev
   ```
   *Note: The server will automatically connect to MySQL, execute `schema.js`, create missing tables, and insert default seed data on startup.*

---

### **4. Frontend Setup**
1. Open a new terminal and navigate to the `brickswall` directory:
   ```bash
   cd brickswall
   npm install
   ```
2. Create a `.env` file inside `brickswall/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Fetch all published portfolio projects | Public |
| `POST` | `/api/projects` | Create a new project entry | Admin |
| `GET` | `/api/blogs` | Fetch published blog articles | Public |
| `POST` | `/api/blogs` | Create a new blog article | Admin |
| `PUT` | `/api/blogs/:id` | Update an existing blog article | Admin |
| `DELETE` | `/api/blogs/:id` | Delete a blog article | Admin |
| `GET` | `/api/pricing` | Fetch package rates & comparison matrix | Public |
| `PUT` | `/api/pricing` | Update package matrix features & rates | Admin |
| `POST` | `/api/upload` | Upload image file (Base64 handler) | Public / Admin |
| `POST` | `/api/inquiries` | Submit customer estimate / contact inquiry | Public |

---

## ✉️ Upcoming Roadmap & Planned Email Quotation Feature

### **Automated Customer Estimate Email Quotation System**
When a user submits an estimate request form, the backend will automatically generate and deliver a branded HTML email quotation directly to the customer's inbox.

#### **Key Components of Planned Email System**:
1. **Automated Budget Calculation**:
   * Computes cost using the user's plot area and package choice:
     * **Basic Package**: ₹1,850 / sq.ft
     * **Premium Package**: ₹2,150 / sq.ft
     * **Luxury Package**: ₹2,750 / sq.ft
2. **Prominent Disclaimer Box**:
   > ⚠️ **Important Notice**: *This is an automated preliminary estimate based on standard specification rates. Final structural costs, foundation engineering, soil testing, custom architectural modifications, and municipal approvals (GHMC) will be finalized after our senior site engineer conducts an in-person site visit.*
3. **1-Tap Direct Contact Action**:
   * Includes direct **Call Site Engineer** (`tel:+919949249091`) and **WhatsApp Direct** (`https://wa.me/919160202008`) buttons inside the email body.
4. **Implementation Plan Ref**:
   * Complete technical specification is documented in `estimate_email_implementation_plan.md`.
