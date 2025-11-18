# Mahjong Calculator iOS App

A simple iOS calculator app for scoring American Mahjong games, supporting both Standard (money/settlement) and Tournament scoring modes.

## Features

- **Standard Mode**: Calculate payouts based on NMJL (National Mahjong League) rules
  - Self-pick and discard win types
  - Jokerless/natural hand bonuses
  - No-exposures (fully concealed) bonuses
  - Misnamed joker penalties
  - Configurable number of players (2-4)

- **Tournament Mode**: Calculate tournament points
  - Base points from card value
  - Self-pick bonus (+10)
  - Jokerless bonus (+20, except Singles & Pairs)
  - Discarder penalties based on winner's exposures
  - Wall game scoring
  - Dead hand tracking
  - Time expired handling
  - False Mah Jongg outcomes

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (will be installed with dependencies)
- iOS Simulator (for testing) or physical iOS device with Expo Go app

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

Or scan the QR code with the Expo Go app on your iOS device.

## Project Structure

```
Calculator/
├── App.tsx                    # Main app entry point
├── components/
│   └── ScoreCalculatorCard.tsx # Main calculator component
├── lib/
│   └── scoring/
│       ├── engine.ts          # Scoring calculation logic
│       └── types.ts           # TypeScript type definitions
├── constants/
│   └── colors.ts              # App color scheme
├── assets/
│   └── images/
│       └── logo.png           # App logo
├── config.ts                  # Default modifiers and payout config
├── package.json
├── app.json                   # Expo configuration
└── tsconfig.json              # TypeScript configuration
```

## Building for Production

To build a standalone iOS app:

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure your project:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

## Scoring Rules

### Standard Mode
- Base points are multiplied based on win type and modifiers
- Self-pick: All players pay 2× base (4× if jokerless)
- Discard: Discarder pays 2× base (4× if jokerless), others pay 1× base (2× if jokerless)
- Misnamed joker: Discarder pays 4× base, others pay nothing

### Tournament Mode
- Winner receives base points from card
- +10 for self-pick
- +20 for jokerless (except Singles & Pairs)
- Discarder penalty: -10 (0-1 exposures) or -20 (2+ exposures)
- Wall game: +10 to each non-dead player
- Time expired: All players get 0 points

## License

Private project - All rights reserved

