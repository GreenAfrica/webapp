# 🌍 GreenAfrica - Recycling Rewards Platform

**Turn plastic bottles into instant rewards while helping the environment.**

GreenAfrica is a comprehensive recycling rewards platform that incentivizes plastic bottle recycling through reverse vending machines, mobile apps, and instant reward redemption. Users earn Green Points for every bottle recycled and can redeem them for airtime, data, and other rewards.

![GreenAfrica Screenshot](https://via.placeholder.com/800x400/8bba8e/ffffff?text=GreenAfrica+Dashboard)

## 🚀 Features

### ✅ **User Authentication**
- Social login (Google, Facebook)
- Phone verification system
- Secure session management

### ✅ **Interactive Dashboard**
- Welcome slides for new users
- Real-time Green Points display
- Activity history with transaction categorization
- Referral system with shareable codes

### ✅ **Reward System**
- Multi-step points redemption flow
- Airtime and data purchases
- Minimum points validation
- Transaction confirmation system

### ✅ **Profile Management** 
- Editable user profiles
- Success confirmation modals
- Form validation and error handling

### ✅ **Impact Tracking**
- Bottles recycled counter
- CO₂ saved calculations
- Location-based activity history
- Referral points tracking

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with custom design system
- **Typography**: [Inter](https://fonts.google.com/specimen/Inter) & [Poppins](https://fonts.google.com/specimen/Poppins) via next/font
- **Language**: TypeScript
- **Development**: Turbopack for fast hot reloading

## 📁 Project Structure

```
greenafrica-rvm/
├── docs/                          # Project documentation
│   ├── Green Africa - Update.md   # Product requirements & ecosystem overview
│   └── UI-Design-Guide.md         # Comprehensive design system guide
├── src/
│   ├── app/                       # Next.js app directory
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Authentication pages
│   │   ├── dashboard/            # Main user dashboard
│   │   ├── layout.tsx            # Root layout with fonts
│   │   └── globals.css           # Global styles & design system
│   └── components/
│       └── shared/
│           └── BaseModal.tsx     # Reusable modal component
├── public/                        # Static assets
└── package.json
```

## 🎨 Design System

The project implements a comprehensive design system with:

- **Brand Colors**: Green palette (#8bba8e, #2e7d33, #e7f6e8)
- **Typography**: Inter for UI, Poppins for headings
- **Components**: Buttons, forms, cards, badges, modals
- **Accessibility**: WCAG AA compliant contrast ratios
- **Responsive**: Mobile-first design approach

📖 **[View Complete Design Guide →](docs/UI-Design-Guide.md)**

## 🌐 Available Routes

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Landing page | Marketing content, stats, how it works |
| `/login` | Authentication | Social login, phone verification |
| `/dashboard` | User dashboard | Points, referrals, history, modals |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd greenafrica-rvm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📚 Documentation

### Core Documentation
- **[Product Overview](docs/Green%20Africa%20-%20Update.md)** - Complete ecosystem overview, user flows, and technical requirements
- **[UI Design Guide](docs/UI-Design-Guide.md)** - Comprehensive design system, components, and implementation guidelines

### Key Features Documentation

#### User Flows
1. **Onboarding**: Welcome slides → Dashboard introduction
2. **Authentication**: Social login → Phone verification → Dashboard
3. **Redemption**: Points selection → Amount choice → Confirmation → Success
4. **Profile**: Edit form → Validation → Success confirmation

#### Modal System
- `BaseModal` component for consistent behavior
- Multi-step flows with navigation
- Success/error state management
- Accessible keyboard navigation

#### Design System Components
```css
/* Example usage */
.btn-primary     /* Primary action buttons */
.btn-secondary   /* Secondary action buttons */
.card           /* Content cards */
.impact-card    /* Special gradient cards */
.input-field    /* Form inputs */
.badge-success  /* Status indicators */
```

## 🎯 User Experience

### Authentication Flow
1. **Login Page** (`/login`)
   - Google/Facebook social authentication
   - Phone number verification with SMS
   - Clean, branded interface

2. **First-Time Users**
   - Welcome slides explaining platform
   - Interactive onboarding experience
   - Automatic dashboard redirect

### Dashboard Experience
- **Points Overview**: Large impact card showing total Green Points
- **Quick Actions**: Primary buttons for redeem/profile actions
- **Referral System**: Copy-to-clipboard referral codes
- **Activity Feed**: Comprehensive transaction history
- **Modal Interactions**: Smooth, accessible modal flows

### Responsive Design
- **Mobile-first** approach for all components
- **Touch-friendly** interaction targets
- **Optimized typography** for all screen sizes
- **Progressive enhancement** for better performance

## 🔧 Development Workflow

### Design System Updates
1. Update colors/spacing in `src/app/globals.css`
2. Add new components following established patterns
3. Test across all breakpoints
4. Update design guide documentation

### Adding New Features
1. Create components in appropriate directories
2. Follow TypeScript best practices
3. Use established design system classes
4. Add proper accessibility attributes
5. Test modal interactions and keyboard navigation

### Code Style
- **TypeScript**: Strict type checking enabled
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes with component patterns
- **Accessibility**: ARIA labels and keyboard navigation

## 🌱 Environmental Impact

GreenAfrica helps users track their positive environmental impact:

- **Bottles Recycled**: Real-time counter of recycled items
- **CO₂ Savings**: Environmental impact calculations  
- **Location Tracking**: Activity across different venues
- **Community Impact**: Referral system for broader adoption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the established design system and code patterns
4. Add appropriate documentation
5. Submit a pull request

## 📄 License

This project is proprietary software for GreenAfrica.

## 📞 Support

For questions about the codebase or design system:
- Review the [UI Design Guide](docs/UI-Design-Guide.md)
- Check the [Product Documentation](docs/Green%20Africa%20-%20Update.md)
- Follow established component patterns

---

**Built with ❤️ for a sustainable future** 🌱
