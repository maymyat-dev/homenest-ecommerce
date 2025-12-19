# 📱 HoemNest – Furniture E-Commerce API

**HomeNest** is a high-availability e-commerce engine designed for the premium furniture market. The system prioritizes **low-latency data fetching**, **secure relational data modeling**, and **automated cache management**.

🌐 **Live Demo: **https://homenest.maymyatmon.com**

---

## 🧰 Tech Stacks

| Layer        | Technology         |
| ------------ | ------------------ |
| Framework    | Express            |
| Language     | NodeJs, Typescript |
| Database     | PostgreSQL         |
| ORM          | Prisma ORM         |
| Cache        | Redis              |
| Queue        | BullMQ             |
| Payments     | Stripe API         |
| File Service | Cloudinary         |

---

## 🚀 Key Features

### 🛠️ API Operations & System Architectures

**Seamless & Secure Authentication:** Uses a dual-token system (Access & Refresh tokens) to keep your session secure while minimizing the need for frequent logins.

**Secure Admin Authentication:** Protected access with role-based permissions to ensure only authorized personnel can manage data.

**Full Resource Management:** Streamlined CRUD (Create, Read, Update, Delete) operations for Products, Blog Posts, and User Accounts.

**Intelligent Cache Management:** Uses Redis to store frequent queries, resulting in lightning-fast API responses and reduced database load.

**Reliable Task Queuing (BullMQ):** Background job processing that ensures critical tasks (like sending emails or clearing cache) are never lost, even if the server restarts.

**System Maintenance Mode:** A dedicated "Maintenance" toggle to safely perform updates while keeping users informed.

**Smart Rate Limiting:** Protects the API from being overwhelmed by too many requests or automated bot attacks.

**Robust File Uploads:** A secure system for managing furniture images with automatic validation.

**HTML Sanitization:** Cleans all user-generated content to prevent XSS (Cross-Site Scripting) attacks and keep the platform safe.

**Localization (i18n):** Ready for a global audience with multi-language support infrastructure.

**Safe & Simple Checkout:** Integrated with Stripe API, allowing you to purchase furniture with industry-leading encryption and support for global payment methods.

---

## 🛠️ Setup

To run this application locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/maymyat-dev/homenest-ecommerce
   cd homenest-ecommerce

   ```

2. **Install Dependencies:**

   ```bash
   npm install

   ```

3. **Environment Configuration:**

   ```bash
   Copy `.env-example` to `.env`
   Fill in necessary credentials and configurations in the `.env` file.

   ```

4. **Database Setup:**

   ```bash
   Connect to your PostgreSQL database and redis
   Run the following command to sync the schema with the project:
   npx prisma generate

   ```

5. **Database Migration:**

   ```bash
   To execute migration: npx prisma db push

   ```

6. **Data Seeding:**

   ```bash
   To seed initial data: npx prisma db seed

   ```

7. **Running the Project:**
   ```bash
   For production: npm start
   For development: npm run dev
   ```
