# 🧥 EFE Apparel

A modern, responsive, SEO-friendly streetwear e-commerce website for **EFE Apparel — Everyday Fabric Essentials**, focused on premium jackets, sweatshirts, sweaters, and contemporary everyday essentials.

Brand reference: [EFE Apparel](https://www.efeapparel.net/) — modern streetwear combining urban culture with refined, upscale aesthetics.

---

## ✨ Features

### Public Website

* Home page with:

  * Hero section
  * Latest collection
  * Featured products
  * Brand story
  * Social section
  * Newsletter / promotional CTA
* Products listing (`/products`)
* Product details (`/products/[slug]`)
* Shopping cart with:

  * Cart drawer
  * `/cart` page
  * Persistent `localStorage` state
* Checkout without customer account or login
* US-only address autocomplete with manual-entry fallback
* Order confirmation page
* Product pricing with:

  * Original price
  * Sale price
  * Discount percentage
  * Savings display
* Size Guide for clothing measurements
* Our Brand / brand story page
* Contact page
* Privacy Policy
* Terms & Conditions
* Loading skeletons
* Empty states
* Custom 404 page
* Responsive design from mobile to large desktop screens
* WhatsApp customer support chat
* Promotional popup / announcement banner

### Admin Dashboard (`/admin`)

* Secure admin login with email + password
* Dashboard summary:

  * Total products
  * Total orders
  * Revenue
  * Pending payments
* Product management:

  * Create products
  * Edit products
  * Soft delete
  * Activate / deactivate
  * Pricing
  * Compare-at pricing
  * Product images
* Order management:

  * Search
  * Filtering
  * Pagination
  * Sorting
  * Status updates
* Account management:

  * Update profile
  * Change password
  * Session invalidation after password change
* Site Settings:

  * Brand name
  * Logo URL
  * Brand description
  * Address
  * Website URL
  * Phone
  * Email
  * Social links
  * WhatsApp number
  * Shipping cost
* Public-facing header, footer, contact information, social links, and SEO metadata are driven from Site Settings where appropriate instead of being hard-coded.

---

## 🧰 Tech Stack

| Area            | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js (App Router), TypeScript                        |
| Styling         | Tailwind CSS                                            |
| Database        | MongoDB + Mongoose (MongoDB Atlas)                      |
| Validation      | Zod, React Hook Form                                    |
| Authentication  | Custom JWT (`jose`) + `bcryptjs`, HTTP-only cookie      |
| Cart State      | Zustand (`persist`)                                     |
| UI Helpers      | lucide-react, react-icons, sonner, clsx, tailwind-merge |
| Address API     | Geoapify (server-side proxy, US only)                   |
| Images          | External image URLs only                                |
| Deployment      | Vercel + MongoDB Atlas                                  |
| Package Manager | pnpm                                                    |

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+
* pnpm
* MongoDB Atlas cluster
* Geoapify API key

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then configure:

```env
MONGODB_URI=

AUTH_SECRET=

SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=

GEOAPIFY_API_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Future payment integration
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

Generate a secure `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

> ⚠️ Never commit `.env.local`. Never expose your MongoDB URI, authentication secret, or API keys publicly.

### 3. Seed the database

Creates:

* Initial admin account
* Sample apparel products
* Default site settings

```bash
pnpm seed
```

### 4. Run the development server

```bash
pnpm dev
```

Website:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

---

## 📜 Scripts

| Command      | Description                             |
| ------------ | --------------------------------------- |
| `pnpm dev`   | Start development server                |
| `pnpm build` | Create production build                 |
| `pnpm start` | Run production build                    |
| `pnpm lint`  | Run ESLint                              |
| `pnpm seed`  | Seed admin, products, and site settings |

---

## 🗺️ Routes

### Public

```text
/                                  Home
/products                          All active products
/products/[slug]                   Product details
/cart                              Shopping cart
/checkout                          Checkout
/order-confirmation/[orderNumber]  Order confirmation
/size-guide                        Clothing size guide
/our-brand                         EFE brand story
/contact                           Contact
/privacy-policy                    Privacy Policy
/terms                             Terms & Conditions
```

### Admin

```text
/admin/login
/admin
/admin/products
/admin/products/new
/admin/products/[id]/edit
/admin/orders
/admin/orders/[id]
/admin/account
/admin/settings
```

---

## 🛒 Customer Flow

```text
Browse Products
      ↓
Product Details
      ↓
Add to Cart / Buy Now
      ↓
Cart
      ↓
Checkout
      ↓
Order Review
      ↓
Place Order
      ↓
Order Confirmation
```

### Buy Now

`Buy Now` adds the selected product to the cart and sends the customer directly to `/cart`.

---

## 👕 Product Model

Products are designed around apparel rather  home fragrance.

Typical product information includes:

* Product name
* Slug
* Description
* Selling price
* Compare-at price
* Currency
* Product images
* Active / inactive state
* Stock
* Created date
* Updated date

The storefront can be used for products such as:

* Jackets
* Sweatshirts
* Sweaters
* Hoodies
* Streetwear essentials
* Seasonal collections

Product pricing and inventory are controlled on the server.

---

## 🗄️ Data Models

| Model          | Purpose                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `Admin`        | Admin account, password hash, token version, failed-login tracking, account lock fields                      |
| `Product`      | Name, slug, description, price, compare-at price, currency, images, stock, active state                      |
| `Order`        | Customer information, shipping address, item snapshots, totals, discount amount, order and payment status    |
| `SiteSettings` | Brand name, logo, description, address, website URL, phone, email, social links, WhatsApp, shipping settings |

### Order Statuses

```text
pending
confirmed
delivered
cancelled
```

### Payment Statuses

```text
pending
paid
failed
refunded
```

### Payment Methods

```text
unpaid
paypal
```

---

## 🏗️ Project Structure

```text
src/

├── app/
│   ├── (public)/        Public storefront pages
│   ├── admin/           Admin login, dashboard and Server Actions
│   └── api/             Route Handlers for customer-facing APIs
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── home/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── admin/
│
├── lib/
│   ├── mongodb/
│   ├── auth/
│   ├── utils/
│   ├── constants/
│   └── validation/
│
├── models/
│   └── Mongoose models
│
├── services/
│   └── Business logic and database operations
│
├── store/
│   └── Zustand cart store
│
├── types/
│
└── proxy.ts
    Admin route protection and request-level session gate

scripts/

└── seed.ts
```

### Architecture Rule

Business logic belongs in `services/`.

Server Actions and Route Handlers should remain thin wrappers:

```text
Authenticate
    ↓
Validate
    ↓
Call Service
    ↓
Return Result
```

Components should focus on UI and interaction rather than database or business logic.

---

## ⚙️ Server Actions vs Route Handlers

### Server Actions

Used for trusted application mutations such as:

* Admin login
* Admin logout
* Product creation
* Product editing
* Product deletion
* Product activation/deactivation
* Order updates
* Account updates
* Password changes
* Site settings updates

### Route Handlers

Used for customer-facing API-style operations such as:

* Customer order creation
* Cart/product validation
* Address suggestions
* Future PayPal webhook
* Other public API interactions

---

## 🔐 Security

* Passwords hashed using `bcryptjs`
* Strong password validation
* JWT authentication using `jose`
* HTTP-only authentication cookie
* Secure cookie configuration in production
* `sameSite=lax`
* Limited session lifetime
* Admin access protected at the proxy layer
* Individual Server Actions and sensitive routes verify the current admin
* Brute-force login protection
* Failed-login lockout
* Password changes invalidate previous sessions through `tokenVersion`
* Server-side Zod validation on all trusted inputs
* No public admin registration endpoint
* No secrets exposed to client-side code
* Product prices are always read from the database
* Frontend prices are never trusted for order totals
* Discounts are calculated server-side
* Product availability is revalidated during checkout
* Stock is verified and decremented atomically when an order is placed
* Security headers configured through `next.config.ts`

---

## 💰 Pricing & Order Integrity

The frontend is responsible only for displaying product information.

The server is responsible for determining:

* Product price
* Compare-at price
* Discount amount
* Shipping cost
* Subtotal
* Order total
* Product availability
* Current product status

A customer cannot modify the frontend price and force the server to accept that amount.

Order items are stored as snapshots so future product changes do not alter historical order records.

---

## 🔍 SEO

The website is structured for modern e-commerce SEO.

### Global SEO

* Dynamic page titles
* Dynamic meta descriptions
* Canonical URLs
* Open Graph metadata
* Twitter/X card metadata
* Robots directives
* XML sitemap
* `robots.txt`
* Semantic HTML
* Accessible heading hierarchy
* Descriptive image alt text
* Optimized `next/image` usage
* Clean product URLs using slugs

### Product SEO

Each product page can generate:

* Product-specific title
* Product-specific description
* Canonical URL
* Product Open Graph image
* Twitter/X preview
* `Product` structured data
* Product price information
* Product availability information
* Brand information

### E-commerce Structured Data

The website should expose structured data appropriate for an apparel store, including:

* `Organization` / `OnlineStore`
* `WebSite`
* `Product`
* `Offer`

Where product variants are introduced, structured data can be extended to represent apparel variants such as size and color.

---

## 📱 Social & Customer Contact

EFE's customer-facing presence can be connected through Site Settings rather than being hard-coded throughout the application.

Supported social channels may include:

* Instagram
* TikTok
* Facebook
* X / Twitter

The website also supports WhatsApp customer communication.

WhatsApp settings store the business phone number rather than a generated chat URL.

---

## 📦 Shipping & Checkout

The first version is designed for a straightforward US-focused storefront.

Checkout supports:

* Customer contact details
* US shipping address
* Address autocomplete
* Manual address entry
* Product validation
* Stock validation
* Server-side pricing
* Shipping calculation
* Order creation
* Order confirmation

---

## 💳 Payments

The first version does not require a live payment gateway.

The order model is structured to support future PayPal integration through:

```text
paymentStatus
paymentMethod
transactionId
```

Future implementation can add:

* PayPal order creation
* Server-side payment verification
* Capture verification
* Webhook handling
* Payment failure handling
* Refund handling

---

## ☁️ Deployment

### 1. Push to GitHub

Do not commit secrets.

### 2. Create MongoDB Atlas production database

Configure the production cluster and network access required by the deployment.

### 3. Import the repository into Vercel

Connect the GitHub repository to Vercel.

### 4. Add environment variables

Configure all production environment variables in Vercel.

### 5. Set the production site URL

```env
NEXT_PUBLIC_SITE_URL=https://www.efeapparel.net
```

### 6. Seed the production database

Run the seed process once against the production database if required:

```bash
pnpm seed
```

### 7. Connect the domain

Verify:

* Homepage
* Product listing
* Product details
* Cart
* Checkout
* Order creation
* Order confirmation
* Admin login
* Admin product management
* Admin order management
* Site settings
* Sitemap
* Robots

---

## 🧪 Pre-Release Checklist

### Storefront

* [ ] Homepage loads correctly
* [ ] Navigation works
* [ ] Products page works
* [ ] Product detail pages work
* [ ] Product images load correctly
* [ ] Product prices are correct
* [ ] Compare-at prices display correctly
* [ ] Discount percentage is correct
* [ ] Cart works
* [ ] Cart persists after refresh
* [ ] Buy Now works
* [ ] Checkout works
* [ ] Address autocomplete works
* [ ] Manual address entry works
* [ ] Order creation works
* [ ] Confirmation page works
* [ ] Size Guide works
* [ ] Our Brand page works
* [ ] Contact page works
* [ ] WhatsApp chat works
* [ ] Promotional popup works

### Security

* [ ] Unauthenticated admin access is blocked
* [ ] Admin login works
* [ ] Wrong password is handled correctly
* [ ] Login lockout works
* [ ] Logout invalidates the session
* [ ] Password change invalidates old sessions
* [ ] Admin actions verify authentication
* [ ] Server-side validation is enabled
* [ ] Frontend price tampering is rejected
* [ ] Inactive products cannot be purchased
* [ ] Out-of-stock products cannot be purchased
* [ ] Stock updates are atomic

### SEO

* [ ] Correct production canonical URL
* [ ] Correct page titles
* [ ] Correct meta descriptions
* [ ] Open Graph image configured
* [ ] Twitter/X metadata configured
* [ ] Product structured data valid
* [ ] Sitemap available
* [ ] Robots available
* [ ] Admin routes blocked from indexing
* [ ] Product URLs use readable slugs
* [ ] Images have useful alt text

### Quality

* [ ] `pnpm lint` passes
* [ ] `pnpm build` passes
* [ ] No TypeScript errors
* [ ] No console errors
* [ ] No horizontal scroll on mobile
* [ ] Tested at 320px
* [ ] Tested at 375px
* [ ] Tested at 768px
* [ ] Tested at 1024px
* [ ] Tested at 1440px+

---

## 🛣️ Roadmap

Future improvements may include:

* PayPal integration
* Email order notifications
* Advanced analytics
* Customer accounts
* Product reviews
* Coupons and promotional codes
* Multiple admin accounts
* Shipping integrations
* Product variants such as size and color
* Wishlist
* Inventory alerts
* Newsletter automation

---

## 🎨 Theme

The storefront uses a warm premium palette designed around EFE's modern fashion positioning.

| Token            | Color     | Use                             |
| ---------------- | --------- | ------------------------------- |
| `primary`        | `#E8751A` | CTA, buttons, highlights        |
| `primary-dark`   | `#C85F0F` | Hover states                    |
| `chocolate`      | `#3B2314` | Headings, dark sections, footer |
| `chocolate-soft` | `#6B4A35` | Secondary text                  |
| `background`     | `#FFF8F0` | Page background                 |
| `surface`        | `#FFFFFF` | Cards and panels                |
| `border`         | `#EADBCB` | Borders and dividers            |

---

## ⚠️ Development Rules

* Work incrementally, phase by phase
* Run TypeScript checks, lint, and build regularly
* Do not change the existing tech stack without approval
* Do not add features outside the project requirements
* Keep components focused and reusable
* Avoid `any`
* Keep business logic inside `services/`
* Keep Server Actions and Route Handlers thin
* Prefer server-side validation for all trusted inputs
* Never trust client-supplied prices or totals
* Avoid hard-coded brand/contact information where Site Settings should be used

---

## 📄 License

Private project.

All rights reserved.

---

## 🔗 Brand

**EFE Apparel — Everyday Fabric Essentials**

Website: https://www.efeapparel.net/

EFE's public-facing site currently positions the brand as modern streetwear combining urban culture with upscale/luxury aesthetics, with a storefront centered around apparel collections, brand storytelling, sizing, and customer contact.

```
```



