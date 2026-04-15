PROJECT GOAL
Build a complete, production-ready full-stack web application called "GymQR Connect" – a QR-code based gym management system with nearby gym suggestions. The platform connects gym owners, trainers, and users. Users buy tokens (1 token = ₹50) via Razorpay, receive a scannable QR code, track their activity in an analytics dashboard, and can also buy gym utensils/equipment/merchandise. Gym owners register their gym, create trainer accounts, and receive token credits when users scan their QR at the gym.
TECH STACK (strictly follow this)

Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui components, Lucide icons
Backend: Next.js API routes + Server Actions
Database: PostgreSQL with Prisma ORM
Authentication: NextAuth.js (credentials + Google OAuth) with role-based access (User, GymOwner, Trainer)
Payments: Razorpay (full integration with webhook verification)
QR Code: qrcode + html5-qrcode (camera scanner)
Maps: Leaflet.js + OpenStreetMap (for nearby gym suggestions) + browser Geolocation API
Charts: Recharts (for analytics dashboard)
File uploads: UploadThing or Cloudinary for gym photos
Deployment ready: Environment variables documented, Vercel-friendly

USER ROLES & PERMISSIONS

User (Customer)
Gym Owner
Trainer (created by Gym Owner, can only scan QR)

CORE FEATURES (implement ALL exactly as described)
1. Gym Owner Flow

Gym Owner registers their gym with: gym name, full address, latitude/longitude (interactive map picker), description, amenities (checkbox list), contact number, photos (multiple).
After registration, the gym automatically appears in "Nearby Gyms" for users.
Gym Owner can create unlimited Trainer accounts (email + password, Trainer role).
Owner Dashboard:
Gym analytics (total tokens received, total visits, revenue chart, monthly breakdown)
List of all trainers
Transaction history (who scanned when and how many tokens credited)
Withdraw / token balance view (tokens are credited to gym account)


2. Trainer Flow

Separate login.
Dedicated QR Scanner Page (full-screen camera view with html5-qrcode).
When a user’s QR is scanned:
Decode QR → verify user has at least 1 token.
Deduct 1 token from user’s balance.
Credit 1 token to the gym’s account (in token format).
Record visit with timestamp, user name, remaining tokens.
Show success screen with user name and remaining tokens.
If invalid/expired/no tokens → clear error message.


3. User Flow

User registration/login.
Home / Discover Page:
“Nearby Gyms” section using browser geolocation + Leaflet map.
List + map view of all registered gyms sorted by distance (use Haversine formula or PostGIS).
Search by city/name.
Click gym → detailed view (photos, amenities, trainers list, distance).

Token Purchase System (most important):
Dedicated “Buy Tokens” page.
Pricing: 1 token = ₹50 (show packages like 10 tokens, 20 tokens, 50 tokens with slight discount).
Razorpay checkout integration (order creation + webhook verification).
On successful payment:
Increase user’s token balance.
Immediately generate and display a unique, scannable QR code (stores userId + timestamp + signature for security).
Show QR in user profile with “Show QR” button (regeneratable).


User Analytics Dashboard:
Beautiful analyzed dashboard with:
Token balance (big card)
Tokens purchased vs tokens used (Recharts pie + line chart)
Visit history table (date, gym name, tokens used)
Activity streak / total visits / average visits per week
Export data button (CSV)


Gym Utensils / Shop Section:
Full e-commerce mini-store.
Products: gym wear, equipment, accessories, supplements (admin/GymOwner can add products later).
Product listing with images, price, add to cart.
Cart + Razorpay checkout.
Order history in user dashboard.


4. Technical & Security Requirements

Role-based route protection (middleware).
All forms validated with Zod.
Proper error handling and loading states everywhere.
Responsive design (mobile-first, especially QR scanner works perfectly on mobile).
Dark/light mode support.
SEO-friendly pages.
Razorpay webhook route to securely update token balance and gym credits.
QR data must be encrypted/signed so it cannot be faked.
Database schema must include:
User (role, tokenBalance)
Gym (location lat/long, ownerId)
Trainer (gymId)
TokenTransaction & VisitLog
Product & Order tables


5. UI/UX Guidelines

Modern fitness theme: dark background, neon green/blue accents, bold typography.
Clean, fast, intuitive navigation (sidebar for dashboard, bottom nav on mobile).
Every page must feel premium and professional.
Include a demo mode / seed data script so the app can be tested immediately after creation.

Final Output from Antigravity
Please generate the complete project with:

Full folder structure
All pages and components
Prisma schema + migrations
All API routes / server actions
Environment variables list (.env.example)
README with setup instructions (including how to add Razorpay keys, Google OAuth, etc.)
Ready-to-run commands (npm run dev, prisma migrate, etc.)

Start building now with this exact specification. Make it scalable and production-ready.