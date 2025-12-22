# DeepShift Design Guidelines

## Design Approach

**Hybrid Approach**: Combine Linear's clean, dark aesthetic with the energy of competitive platforms (CodeChef, Codeforces) and the trust signals of educational tools (Khan Academy, Coursera). The dark theme creates focus for contest-taking while maintaining professional credibility.

## Typography

**Font Stack**:
- Headings: Inter (700, 600) - Google Fonts
- Body: Inter (400, 500) 
- Monospace (code): JetBrains Mono (400) - for coding contests

**Hierarchy**:
- Hero/Main Headers: text-4xl md:text-6xl font-bold
- Section Headers: text-2xl md:text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Timer/Stats: text-3xl md:text-5xl font-bold (tabular numbers)
- Captions/Meta: text-sm text-gray-400

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 24
- Component padding: p-6 or p-8
- Section spacing: py-16 md:py-24
- Card gaps: gap-6 or gap-8
- Tight groupings: space-y-4

**Grid System**:
- Contest cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard stats: grid-cols-2 lg:grid-cols-4
- Max container width: max-w-7xl

## Landing Page Structure

**Hero Section** (h-screen):
- Full-width gradient background (dark theme with accent overlay)
- Large hero image: Dynamic collage of students celebrating/competing (excited, diverse group)
- Centered headline + subheadline + dual CTAs ("Join Now" primary, "Admin Login" secondary ghost button)
- Floating stats cards overlay: "2000+ Active Students", "₹10L+ Prize Pool", "500+ Contests"

**Sections** (6 total):
1. Hero (full viewport)
2. How It Works (3-column: Register → Compete → Win with icons)
3. Contest Types (4-card grid with category icons)
4. Recent Winners (horizontal scrolling cards with avatars, names, prizes)
5. Previous Contests (6-card grid, "View All" link)
6. Creator CTA (split layout: benefits list + signup form)

**Footer**: 
- 4-column layout: About, Quick Links, Contest Categories, Contact
- Newsletter signup inline
- Social icons
- Trust badges ("Secure Payments", "24/7 Support")

## Dashboard Layouts

**Student Dashboard**:
- Top stats bar: 4 cards (Contests Joined, Upcoming, Balance, Rank)
- Sidebar navigation (collapsible on mobile)
- Main area: Contest cards with prominent "Join" buttons, status badges
- Filters: Tabs (All, MCQ, Coding, Hackathons) + search

**Admin Panel**:
- Dense table layout for contest management
- Action buttons in every row
- Modals for create/edit (not new pages)
- Analytics: Chart.js graphs for registrations, revenue

**Creator Dashboard**:
- Earnings hero card (large, prominent)
- Referral link with copy button (styled input + icon button)
- Withdrawal CTA (always visible if balance > ₹300)
- Referrals table with pagination

## Component Library

**Contest Cards**:
- Dark card (bg-gray-800/900)
- Badge for contest type (top-right, colored)
- Icon for category
- Prize in large bold text
- Fee, deadline, participants count in smaller text
- Status indicator (dot + text)
- Full-width action button at bottom

**Timer Component** (Contest Page):
- Fixed top bar with large countdown
- Color changes: green (>30min) → yellow (10-30min) → red (<10min)
- Progress bar underneath

**Question Container**:
- Numbered clearly (1/50)
- Question text with good spacing
- Options for MCQ: Radio buttons, large click targets
- Code editor: Monaco Editor with dark theme, language selector
- Navigation: Previous/Next buttons, question palette sidebar

**Payment Flow**:
- Stepper indicator (3 steps)
- QR code centered, large (300x300px minimum)
- Upload area: Dashed border, drag-drop enabled
- Preview thumbnail after upload

**Modals/Overlays**:
- Centered, max-w-2xl
- Dark backdrop with blur
- Close button (top-right)
- Action buttons (bottom-right, primary + secondary)

## Anti-Cheating UI Elements

- Fullscreen overlay prompt (cannot dismiss)
- Tab-switch warning banner (red, fixed top)
- Dummy camera preview: Small circle (bottom-left, pulsing border)
- Warning count indicator if multiple violations

## Images

**Hero Image**: Vibrant photo of diverse Indian students celebrating/competing (laptops, excitement, teamwork) - overlay with dark gradient
**Contest Category Icons**: Use Heroicons (code, academic-cap, trophy, puzzle-piece)
**Winner Avatars**: Circular, bordered with glow effect
**Empty States**: Illustrations for "No contests joined" using Undraw (dark theme variants)

## Key Differentiators

- **Competitive Energy**: Leaderboard animations, live participant counts, countdown timers
- **Trust Signals**: Admin verification badges, secure payment indicators, encrypted connection notices
- **Mobile Priority**: Bottom navigation on mobile, swipeable contest cards, thumb-friendly button sizes (min 44px)
- **Status Clarity**: Color-coded badges (green: live, yellow: pending, blue: upcoming, gray: completed)

**No hover states on blurred-background buttons** - rely on Button component's built-in states