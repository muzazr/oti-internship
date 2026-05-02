# Classes Overview — Implementation Plan

> **Source**: Figma Design — [Figma UI Internship OmahTI UGM (Design)](https://www.figma.com/design/j7zuZYKvmzdB2axojslld6/Figma-UI-Internship-OmahTI-UGM--Design-?node-id=285-693&m=dev)
> **Frame**: `Classes` (ID: `285:693`) — 1440 × 1020 px

---

## 1. Design Overview

The "Classes" page is a **teacher dashboard** for the **MitBridge Educator Portal**. It features a left sidebar navigation, a top header bar, and a main content area displaying class cards in a responsive grid.

### Page Layout (1440 × 1020px)

```
┌──────────────────────────────────────────────────────────┐
│                         HEADER (64px)                     │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  SIDEBAR   │           MAIN CONTENT                     │
│  (256px)   │                                            │
│            │   "Classes Overview"                        │
│  - Brand   │   "Berikut kelas anda..."                  │
│  - Nav     │                                            │
│  - Logout  │   ┌────────┐ ┌────────┐ ┌────────┐        │
│            │   │ Card 1 │ │ Card 2 │ │ Card 3 │        │
│            │   └────────┘ └────────┘ └────────┘        │
│            │   ┌──────────────────┐                     │
│            │   │ + Create New     │                     │
│            │   └──────────────────┘                     │
│            │                                            │
└────────────┴─────────────────────────────────────────────┘
```

---

## 2. Color Palette

| Token / Usage | Hex Value | CSS Variable (if mapped) |
|---|---|---|
| Page Background | `#FAF8FF` | `--background` |
| Dark Text (titles, names) | `#191B23` | `--foreground` |
| Body Text (subtitles, counts) | `#434655` | `--foreground-secondary` |
| Primary Blue (CTA buttons) | `#003FA3` | `--primary-400` |
| Brand Blue (active nav, logo) | `#2563EB` | Custom `--brand-blue` |
| Active Nav Background | `#EFF6FF` | Custom |
| Red Pin/Bookmark Icon | `#FA0909` | Custom |
| Notification Dot | `#BA1A1A` | `--error-200` |
| Muted Text (role, subtitle) | `#565F6B` | Custom |
| Nav Inactive Text | `#6B7280` | Custom |
| Icon Gray (more vert) | `#737686` | Custom |
| Placeholder Text | `#8C8D91` | Custom |
| Sidebar Subtitle | `#9CA3AF` | Custom |
| White (cards, header, sidebar) | `#FFFFFF` | `--neutral-100` |
| Light Purple BG (search, create card) | `#F3F3FE` | Custom |
| Avatar Overflow BG | `#EDEDED` | Custom |
| Card Border | `#E1E2ED` | Custom |
| Divider/Separator | `#F3F4F6` | Custom |
| Search Bar Border | `#EDEEEF` | Custom |
| Create Card Border | `#C3C6D7` | Custom |

---

## 3. Typography

**Font Family**: Inter (via `next/font/google`)

| Style Name | Weight | Size | Line Height | Usage |
|---|---|---|---|---|
| Brand Name | Black (900) | 20px | auto | "MitBridge" logo text |
| Page Title | Bold (700) | 24px | ~29px | "Classes Overview" |
| Card Title | Bold (700) | 20px | ~24px | "Matematika - X IPA 1" |
| Create Label | Regular (400) | 20px | ~24px | "Create New Class" |
| Active Nav Label | Bold (700) | 16px | ~19px | "Classes" (active state) |
| Nav Label | Medium (500) | 16px | ~19px | "Dashboard" |
| Page Subtitle | Regular (400) | 16px | ~19px | "Berikut kelas anda..." |
| User Name | Bold (700) | 14px | ~17px | "Pak Yosef" |
| Student Count | Regular (400) | 14px | ~17px | "32 Students" |
| Search Placeholder | Medium (500) | 14px | ~17px | "Cari Kelasmu" |
| Sub-nav Labels | Medium (500) | 14px | ~17px | "Submissions", "Analytics" |
| Button Text | Regular (400) | 12px | ~15px | "Detail Kelas" |
| User Role | Medium (500) | 12px | ~15px | "Guru Matematika" |
| Overflow Badge | Bold (700) | 10px | ~12px | "+29" |
| Educator Portal | Bold (700) | 10px | ~12px | "Educator Portal" |

---

## 4. File Structure

```
src/
├── app/
│   └── guru/
│       └── (dashboard)/
│           ├── layout.tsx              ← Dashboard shell (sidebar + header)
│           └── classes/
│               └── page.tsx            ← Classes overview page
├── components/
│   └── guru/
│       └── dashboard/
│           ├── sidebar.tsx             ← Left sidebar navigation
│           ├── header.tsx              ← Top header bar
│           └── classes/
│               ├── class-card.tsx      ← Individual class card
│               ├── create-class-card.tsx ← "Create New Class" card
│               └── avatar-group.tsx    ← Overlapping avatar stack
└── lib/
    └── data/
        └── mock-classes.ts            ← Mock data & TypeScript interfaces
```

---

## 5. Component Specifications

### 5.1 Dashboard Layout (`(dashboard)/layout.tsx`)

A **route group** layout that wraps all authenticated guru dashboard pages.

```
Structure:
- <div> flex, min-h-screen
  - <Sidebar /> — fixed left, w-64, h-screen
  - <div> flex-1, flex flex-col
    - <Header /> — sticky top, h-16
    - <main> flex-1, overflow-y-auto, p-8, bg-[#FAF8FF]
      - {children}
```

**Font Setup** (in this layout or parent):
```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
});
```

---

### 5.2 Sidebar (`sidebar.tsx`)

| Property | Value |
|---|---|
| Width | 256px (`w-64`) |
| Height | Full viewport (`h-screen`) |
| Background | White `#FFFFFF` |
| Border | Right `0.67px` solid `#F3F4F6` |
| Padding | 16px all sides |
| Gap between sections | 32px |

**Sections:**

#### Brand Section
- "MitBridge" — Inter Black 900, 20px, color `#2563EB`
- "Educator Portal" — Inter Bold 700, 10px, color `#9CA3AF`

#### Navigation Items
Each item: horizontal flex, padding 16px H / 12px V, gap 12px, rounded-lg

| Item | Icon (Lucide) | Label | State |
|---|---|---|---|
| Dashboard | `LayoutDashboard` | "Dashboard" | Inactive |
| **Classes** | `School` | "Classes" | **Active** |
| Submissions | `ClipboardList` | "Submissions" | Inactive |
| Analytics | `BarChart3` | "Analytics" | Inactive |

**Active State Styling:**
- Background: `#EFF6FF`
- Right border: 4px solid `#2563EB`
- Text + Icon color: `#2563EB`
- Font weight: Bold (700)

**Inactive State Styling:**
- Background: transparent
- Text color: `#6B7280`
- Font weight: Medium (500)

#### Bottom Section (Logout)
- Icon: `LogOut` (Lucide)
- Label: "Logout" — Inter Medium 500, 14px, `#6B7280`

---

### 5.3 Header (`header.tsx`)

| Property | Value |
|---|---|
| Height | 64px (`h-16`) |
| Background | White `#FFFFFF` |
| Border | Bottom `0.67px` solid `#F3F4F6` |
| Padding | 32px horizontal, 12px vertical |
| Layout | Flex, justify-between, items-center |

**Left: Search Bar**
- Width: 384px
- Background: `#F3F3FE`
- Border: `0.67px` solid `#EDEEEF`
- Border Radius: 9999px (pill)
- Padding: 6px vertical, 16px horizontal
- Gap: 8px
- Icon: `Search` (Lucide, 20px, `#424654`)
- Placeholder: "Cari Kelasmu" — Inter Medium 500, 14px, `#8C8D91`

**Right: Actions**
- Gap: 24px between icon group and profile
- Icon buttons (gap 16px between them):
  - `Bell` (24px) — with red notification dot (8×8px, `#BA1A1A`, white 2px border, absolute positioned top-right)
  - `HelpCircle` (24px)
  - `Settings` (24px)
  - All icons: color `#424654`
- Divider: left border `0.67px` solid `#F3F4F6`, padding-left 24px
- User Profile:
  - Name: "Pak Yosef" — Inter Bold 700, 14px, `#191B23`, text-right
  - Role: "Guru Matematika" — Inter Medium 500, 12px, `#565F6B`, text-right
  - Avatar: 40×40px circular image

---

### 5.4 Classes Page (`classes/page.tsx`)

**Welcome Section:**
- Title: "Classes Overview" — Inter Bold 700, 24px, `#191B23`
- Subtitle: "Berikut kelas anda, silahkan menambahkan kelas apabila diperlukan" — Inter Regular 400, 16px, `#565F6B`
- Margin bottom: ~32px

**Card Grid:**
- Display: CSS Grid
- Columns: `repeat(auto-fill, minmax(340px, 1fr))` (3 columns at 1440px)
- Gap: 32px horizontal, 30px vertical
- Cards rendered from mock data + one "Create New Class" card at the end

---

### 5.5 Class Card (`class-card.tsx`)

| Property | Value |
|---|---|
| Width | ~347px (flexible in grid) |
| Height | ~367px (auto based on content) |
| Background | White `#FFFFFF` |
| Border | `0.67px` solid `#E1E2ED` |
| Border Radius | 12px |
| Padding | 16px |
| Gap | 16px between internal sections |
| Overflow | Hidden (for cover image) |

**Internal Structure (top to bottom):**

1. **Cover Image**
   - Width: 100% (fills card padding area)
   - Height: 128px
   - Border Radius: 8px
   - Object Fit: cover
   - Placeholder: gradient or stock image

2. **Title Row** (flex, justify-between, items-center)
   - Left: Class name — Inter Bold 700, 20px, `#191B23`
   - Right: Red pin icon (`Pin` from Lucide, 16px, `#FA0909`) + More menu (`MoreVertical`, 24px, `#737686`)

3. **Student Count**
   - Text: "{n} Students" — Inter Regular 400, 14px, `#424654`

4. **Avatar Group** (see 5.7)
   - Shows 2-3 circular avatars (32×32px) + overflow badge

5. **CTA Button**
   - Width: 100%
   - Height: 40px
   - Background: `#003FA3`
   - Border Radius: 8px
   - Text: "Detail Kelas" — Inter Regular 400, 12px, White
   - Right icon: `ArrowRight` (Lucide, 14px, White, stroke-width 2)
   - Layout: flex, justify-between (text left, icon right), items-center, px-4

---

### 5.6 Create New Class Card (`create-class-card.tsx`)

| Property | Value |
|---|---|
| Width | Same as class cards (grid) |
| Height | ~249px |
| Background | `#F3F3FE` |
| Border | 2px dashed `#C3C6D7` |
| Border Radius | 12px |
| Layout | Flex, flex-col, items-center, justify-center |
| Gap | 16px |

**Contents (centered):**
1. **Add Button Circle**
   - Size: 64×64px
   - Background: `#003FA3`
   - Border Radius: 9999px (circle)
   - Icon: `Plus` (Lucide, 30px, White)

2. **Label**
   - Text: "Create New Class" — Inter Regular 400, 20px, `#191B23`, text-center

---

### 5.7 Avatar Group (`avatar-group.tsx`)

A row of overlapping circular avatar images with an overflow count badge.

| Property | Value |
|---|---|
| Layout | Flex, items-center |
| Avatar Size | 32×32px |
| Avatar Border Radius | 9999px (circle) |
| Overlap | -8px margin-left (except first) |
| Avatar Border | 2px solid white |

**Overflow Badge:**
- Size: 32×32px
- Background: `#EDEDED`
- Border: 2px solid white
- Border Radius: 9999px
- Text: "+{n}" — Inter Bold 700, 10px, `#191B23`
- Layout: flex, items-center, justify-center

**Props:**
```tsx
interface AvatarGroupProps {
  avatars: string[];       // Array of image URLs (show first 2-3)
  totalCount: number;      // Total number of students
  maxVisible?: number;     // Max avatars to show (default: 3)
}
```

---

## 6. Data Model & Mock Data

### TypeScript Interface

```typescript
// src/lib/data/mock-classes.ts

export interface ClassData {
  id: string;
  name: string;            // e.g., "Matematika - X IPA 1"
  coverImage: string;      // URL or path to cover image
  studentCount: number;    // e.g., 32
  isPinned: boolean;       // Red pin icon visibility
  avatars: string[];       // Student avatar URLs
  buttonLabel: string;     // "Detail Kelas" or "Open class"
}

export const mockClasses: ClassData[] = [
  {
    id: "1",
    name: "Matematika - X IPA 1",
    coverImage: "/images/classes/math-cover-1.jpg",
    studentCount: 32,
    isPinned: true,
    avatars: [
      "/images/avatars/student-1.jpg",
      "/images/avatars/student-2.jpg",
    ],
    buttonLabel: "Detail Kelas",
  },
  {
    id: "2",
    name: "Matematika - XI IPA 2",
    coverImage: "/images/classes/math-cover-2.jpg",
    studentCount: 30,
    isPinned: true,
    avatars: [
      "/images/avatars/student-3.jpg",
      "/images/avatars/student-4.jpg",
    ],
    buttonLabel: "Detail Kelas",
  },
  {
    id: "3",
    name: "Matematika - XII IPA 3",
    coverImage: "/images/classes/math-cover-3.jpg",
    studentCount: 30,
    isPinned: true,
    avatars: [
      "/images/avatars/student-5.jpg",
      "/images/avatars/student-6.jpg",
    ],
    buttonLabel: "Open class",
  },
];
```

---

## 7. Responsive Behavior

While the Figma design targets **1440px desktop**, the implementation should gracefully adapt:

| Breakpoint | Behavior |
|---|---|
| `≥1280px` (xl) | Full layout as designed — sidebar visible, 3-column grid |
| `1024px–1279px` (lg) | Sidebar collapses to icons only (w-16), 2-column grid |
| `768px–1023px` (md) | Sidebar hidden (hamburger toggle), 2-column grid |
| `<768px` (sm) | Sidebar hidden, 1-column grid, header simplified |

---

## 8. Interactions & States

| Element | Interaction | Behavior |
|---|---|---|
| Nav items | Hover | Light background tint |
| Nav items | Active | Blue bg + right border + blue text |
| Class card | Hover | Subtle shadow elevation (`shadow-md`) |
| "Detail Kelas" button | Hover | Slightly lighter blue (`#0050CC`) |
| "Create New Class" card | Hover | Border color darkens, subtle scale |
| More menu (⋮) | Click | Dropdown (future: edit, delete, archive) |
| Search bar | Focus | Border color change to `#003FA3` |
| Notification bell | Badge | Red dot indicates unread notifications |

---

## 9. Icon Mapping (Figma Material Icons → Lucide React)

| Figma Icon | Lucide Equivalent | Usage |
|---|---|---|
| `dashboard` | `LayoutDashboard` | Sidebar nav |
| `school` | `School` | Sidebar nav (Classes) |
| `assignment` | `ClipboardList` | Sidebar nav (Submissions) |
| `analytics` | `BarChart3` | Sidebar nav (Analytics) |
| `logout` | `LogOut` | Sidebar bottom |
| `search` | `Search` | Header search bar |
| `notifications` | `Bell` | Header actions |
| `help_outline` | `HelpCircle` | Header actions |
| `settings` | `Settings` | Header actions |
| `more_vert` | `MoreVertical` | Card menu |
| `add` | `Plus` | Create card |
| `arrow-right` | `ArrowRight` | Card CTA button |

---

## 10. Implementation Order

1. **Font Setup** — Add Inter font to the guru dashboard layout
2. **Mock Data** — Create `mock-classes.ts` with interfaces and sample data
3. **Dashboard Layout** — Create `(dashboard)/layout.tsx` with flex container
4. **Sidebar** — Build sidebar with brand, nav, and logout sections
5. **Header** — Build header with search, icons, and profile
6. **Avatar Group** — Small reusable component
7. **Class Card** — Individual card with all sections
8. **Create Class Card** — Simpler card variant
9. **Classes Page** — Assemble grid with cards
10. **Polish** — Hover states, transitions, responsive tweaks

---

## 11. Dependencies

All dependencies are **already installed** in the project:

- `next` (15.5.15) — App Router, `next/font/google`
- `tailwindcss` (4.x) — Utility-first styling
- `lucide-react` (1.8.0) — Icon library
- `class-variance-authority` — Component variants (for button)
- `clsx` + `tailwind-merge` — Conditional class merging

**No additional packages needed.**

---

## 12. Accessibility Considerations

- Sidebar nav uses `<nav>` with `aria-label="Main navigation"`
- Active nav item uses `aria-current="page"`
- Search input has proper `<label>` (visually hidden) and `placeholder`
- Card buttons are `<button>` or `<a>` with descriptive `aria-label`
- Avatar images have `alt` text with student names
- Color contrast ratios meet WCAG AA (verified: `#191B23` on `#FFFFFF` = 16.5:1)
- Notification badge has `aria-label="3 unread notifications"`

---

## 13. Notes & Assumptions

1. **Images**: Cover images and avatars will use placeholder images initially (can use `https://picsum.photos` or local `/public/images/` assets)
2. **Navigation links**: Sidebar items link to `/guru/classes`, `/guru/submissions`, `/guru/analytics`, `/guru/dashboard` — only `/guru/classes` will be implemented now
3. **Card 3 inconsistency**: The third card in Figma says "Open class" instead of "Detail Kelas" — this is preserved as a `buttonLabel` prop to support both variants
4. **"Create New Class"**: Will open a modal/dialog (future implementation) — for now, the card is a clickable button
5. **User data**: "Pak Yosef" / "Guru Matematika" will be hardcoded initially; later replaced with auth context data from Supabase
