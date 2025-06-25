# Raydium Frontend v3

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-13.3.1-black.svg)](https://nextjs.org/)

A modern, feature-rich frontend application for the Raydium decentralized exchange on Solana blockchain. This is the official v3 frontend implementation providing a comprehensive DeFi trading experience.

## 🚀 Features

- **Decentralized Trading**: Swap tokens with advanced AMM (Automated Market Maker) technology
- **Liquidity Management**: Add, remove, and manage liquidity positions
- **Yield Farming**: Participate in farming programs to earn rewards
- **Launchpad**: Discover and participate in new token launches
- **Portfolio Management**: Track your assets and positions across the platform
- **Cross-Chain Bridge**: Seamless asset transfers between different blockchains
- **Advanced Charts**: Professional trading charts powered by TradingView
- **Mobile Responsive**: Optimized experience across all devices
- **Multi-Language Support**: Internationalization with i18next
- **Wallet Integration**: Support for multiple Solana wallets

## 🛠 Tech Stack

- **Framework**: [Next.js 13](https://nextjs.org/) with TypeScript
- **UI Library**: [Chakra UI](https://chakra-ui.com/) with custom theming
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Blockchain**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- **Charts**: [Lightweight Charts](https://www.tradingview.com/lightweight-charts/)
- **Form Handling**: [Formik](https://formik.org/) with [Yup](https://github.com/jquense/yup)
- **Internationalization**: [i18next](https://www.i18next.com/)
- **Error Tracking**: [Sentry](https://sentry.io/)

## 📋 Prerequisites

- Node.js >= 16
- npm or yarn package manager
- Solana wallet (Phantom, Solflare, etc.)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/raydium-io/raydium-frontend-v3.git
cd raydium-frontend-v3
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3002](http://localhost:3002) to view the application.

## 📦 Available Scripts

- `npm run dev` - Start development server on port 3002
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## 🏗 Project Structure

```
src/
├── api/                 # API integration and services
├── components/          # Reusable UI components
├── features/           # Feature-specific components and logic
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization files
├── pages/              # Next.js pages and routing
├── provider/           # Context providers and theme
├── store/              # State management with Zustand
├── theme/              # Design system and styling
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## 🔧 Configuration

### Wallet Configuration

The application supports multiple Solana wallet adapters:

- Phantom
- Solflare
- Slope
- Exodus
- Glow
- Ledger
- WalletConnect

### Network Configuration

Default RPC endpoints are configured for:
- Mainnet Beta
- Devnet (for testing)

## 🌐 Internationalization

The application supports multiple languages through i18next. Language files are located in `src/i18n/`.

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Follow the existing code style and patterns

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Raydium Official Website](https://raydium.io/)
- [Raydium Documentation](https://raydium.gitbook.io/raydium/)
- [Solana Documentation](https://docs.solana.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🆘 Support

For support and questions:

- Check the [documentation](https://raydium.gitbook.io/raydium/)
- Join the [Raydium Discord](https://discord.gg/raydium)
- Open an issue on GitHub

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. Cryptocurrency trading involves substantial risk and may result in the loss of your invested capital.
