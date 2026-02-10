# UI/UX Design Guideline for Expense Tracker App

## 1. Visual Identity & Color Palette
- **Primary Color**: Deep Blue (#2563EB) - Trust, stability, professionalism.
- **Secondary Color**: Emerald Green (#10B981) - Positive financial growth, income.
- **Accent Color**: Coral Red (#EF4444) - Expenses, alerts.
- **Background**: Light Gray/White (#F3F4F6 / #FFFFFF) - Clean, airy feel.
- **Typography**: Inter or Roboto (Modern sans-serif).
  - Headings: Bold, distinct (e.g., 24px/32px).
  - Body: Readable (16px), high contrast.

## 2. Layout & Structure
- **Dashboard-First Approach**: The main view is a dashboard summarizing financial health.
- **Responsive Grid**:
  - **Desktop**: Sidebar navigation (or top bar), 3-column layout for summary cards, 2-column for charts and recent list.
  - **Mobile**: Stacked layout, bottom navigation bar or hamburger menu.
- **Card-Based Design**: Enclose distinct sections (Summary, Charts, Recent Transactions) in white cards with soft shadows (`shadow-sm` or `shadow-md`) and rounded corners (`rounded-xl`).

## 3. Component Guidelines

### A. Dashboard Cards (Summary)
- **Total Balance/Expense**: Large, bold numbers.
- **Trend Indicators**: Small arrow icons (up/down) with percentage changes (green/red).

### B. Input Forms (Add Expense)
- **Modal or Inline**: Use a slide-over or modal for adding expenses to keep context.
- **Input Fields**:
  - Clear labels.
  - Input groups with icons (e.g., calendar icon for date, dollar sign for amount).
  - Validation: Real-time feedback (red border + error message).

### C. Data Visualization (Charts)
- **Pie Chart**: Breakdown by category (Food, Transport, etc.). Use distinct but harmonious colors.
- **Line/Bar Chart**: Spending over time (Daily/Monthly).

### D. Expense List
- **Clean Rows**: Date, Category Icon, Description, Amount.
- **Grouping**: Group by date (e.g., "Today", "Yesterday").
- **Actions**: Edit/Delete buttons visible on hover (desktop) or swipe/long-press (mobile).

## 4. User Experience (UX) Principles
- **Minimal Clicks**: Adding an expense should be accessible within 1 click (Floating Action Button - FAB).
- **Immediate Feedback**: Toast notifications for "Expense Added", "Deleted", etc.
- **Empty States**: Friendly illustrations/text when no data exists (e.g., "No expenses yet. Start tracking!").
- **Persistence**: Auto-save to localStorage.

## 5. Mobile Considerations
- **Touch Targets**: Buttons at least 44x44px.
- **Readable Text**: No font smaller than 14px for critical info.
