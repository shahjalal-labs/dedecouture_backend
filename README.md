# Dede Couture Backend - Luxury Atelier & Bespoke Fashion API

<p align="center">
  <img src="assets/banner.svg" alt="dedecouture_backend Banner" width="100%">
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.21-black?style=for-the-badge&logo=express" alt="Express"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma" alt="Prisma"></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB"></a>
  <a href="https://socket.io"><img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io" alt="Socket.io"></a>
  <a href="https://stripe.com"><img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe" alt="Stripe"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License"></a>
</p>

---

## 📖 Overview

**dedecouture_backend** is a luxury fashion atelier and bespoke tailoring platform API built with Node.js, Express.js, TypeScript, and Prisma ORM with MongoDB. The service manages designer brand collections, editorial lookbook posts, client styling reviews, real-time client-stylist chat via WebSockets, and Stripe payments.

---

## ⚡ Key Features

- 👗 **Haute Couture & Brand Portfolio:** Manage designer brands, runway collections, and custom garments.
- 📖 **Editorial Lookbook & Community:** Visual posts, lookbook galleries, client comments, and social engagement.
- 💬 **Real-Time Stylist Advisory Chat:** Live WebSocket messaging connecting bespoke clients with personal stylists.
- 💳 **Stripe Payment & Webhook Processing:** Secure checkout and automated webhook confirmation for luxury orders.
- ☁️ **DigitalOcean Spaces CDN:** High-resolution lookbook photography storage with S3 API.
- 🔔 **Firebase Cloud Messaging:** Instant push notifications for custom order updates and styling notes.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client[Web & Mobile Fashion Clients] -->|HTTPS REST| Router[Express Application Gateway]
    Client <-->|WSS Socket.io| ChatGateway[Live Stylist Consultation]

    subgraph Security ["Security & Validation"]
        Router --> Auth[JWT Role Guard]
        Router --> Val[Zod Schema Validator]
    end

    subgraph CoreServices ["Fashion Business Modules"]
        Auth --> BrandMod[Brand & Designer Collections]
        Auth --> PostMod[Lookbook Editorial Posts]
        Auth --> CommentMod[Client Feedback & Comments]
        Auth --> PaymentMod[Stripe Payment Engine]
    end

    subgraph Persistence ["Data & CDN"]
        CoreServices --> Prisma[Prisma ORM Client]
        ChatGateway --> Prisma
        Prisma --> MongoDB[(MongoDB Cluster)]
        CoreServices --> DO[DigitalOcean Spaces S3]
    end
```

---

## 📂 Directory Structure

```text
.
├── src/
│   ├── app/
│   ├── components/
│   └── ...
├── assets/
│   └── banner.svg
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── LICENSE
```

---

## 🛠️ Tech Stack & Dependencies

| Layer / Library | Version | Description |
|---|---|---|
| **Express.js** | `v4.21` | HTTP routing and middleware framework |
| **TypeScript** | `v5.x` | Type safety and interface contracts |
| **Prisma ORM** | `v6.x` | MongoDB modeling and query engine |
| **Socket.io** | `v4.8` | Real-time client-to-stylist consultation chat |
| **Stripe SDK** | `v17.x` | Luxury fashion payment transactions |
| **AWS SDK (S3 Client)** | `v3.x` | High-resolution lookbook image uploads |
| **Firebase Admin SDK** | `v13.x` | Push notification alert dispatch |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on the provided sample:

```bash
cp .env.example .env
```

Configurable variables:

```env
PORT=5002
NODE_ENV=development
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/dedecouture?retryWrites=true&w=majority

JWT_SECRET=super_secret_jwt_key
EXPIRES_IN=15d
BCRYPT_SALT_ROUNDS=12

# Stripe
STRIPE_PK=pk_test_your_stripe_public_key
STRIPE_SK=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# DigitalOcean Spaces S3
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_do_spaces_key
DO_SPACES_SECRET=your_do_spaces_secret
DO_SPACES_BUCKET=dedecouture-assets

# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.x or higher recommended)
- Package Manager (`npm`, `yarn`, or `pnpm`)

### Installation

```bash
# Clone repository
git clone https://github.com/shahjalal-labs/dedecouture_backend.git
cd dedecouture_backend

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
# or for backend services
npm run start:dev
```

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
