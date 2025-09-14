# 🚀 MyHustle - Digital Marketplace & Booking Platform

A modern, responsive web marketplace that connects local businesses with customers. Built with Next.js, TypeScript, and Firebase.

## 🔥 Features

- **🏪 Store Marketplace** - Browse local businesses and services
- **🔐 Authentication** - Secure login/signup with Firebase Auth
- **📱 Responsive Design** - Neumorphic UI that works on all devices
- **🛒 Shopping Cart** - Add products and manage orders
- **📅 Booking System** - Schedule appointments with service providers
- **💬 Real-time Messaging** - Chat between customers and businesses
- **📊 Analytics Dashboard** - Business insights for store owners

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + Custom Neumorphic Design
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/myhustle-website.git
   cd myhustle-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Add your Firebase credentials
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Environment Variables

Create a `.env.local` file with your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

This app is optimized for deployment on Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/myhustle-website)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Neumorphic UI components
│   └── providers/         # Context providers
├── lib/
│   ├── firebase/          # Firebase configuration
│   ├── store/             # Zustand stores
│   └── utils.ts           # Utility functions
├── styles/
│   └── neumorphic.css     # Neumorphic design system
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🎨 Design System

This project uses a custom neumorphic design system that creates soft, extruded plastic-like UI elements. The design is mobile-first and fully responsive.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help with setup, please open an issue or contact the development team.

---

**Built with ❤️ for the hustle community**
