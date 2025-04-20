# Cornpanion - Cornhole Scoreboard PWA

A Progressive Web App for tracking cornhole game scores in real-time, with multiplayer support.

## Features

- **Solo Mode**: Track scores offline on a single device
- **Host/Join**: Create a game room and share a 4-character code for others to join
- **Real-time Updates**: All connected users see score changes instantly
- **Math Mode**: Calculate points based on bags on board (1pt) and in hole (3pts)
- **Bust Rule**: Option to reset scores when a team exceeds the score limit
- **Customization**: Set team names, colors, and game rules
- **Installable**: Works as a standalone app on mobile and desktop
- **Offline Support**: Solo mode works without an internet connection

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cornpanion.git
cd cornpanion
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Host a Game

1. Click "Host Game" on the home screen
2. Configure game settings (score limit, bust rule, team names)
3. Share the 4-character lobby code or copy the invite link
4. Click "Start Game" when everyone has joined

### Join a Game

1. Click "Join Game" on the home screen
2. Enter the 4-character lobby code
3. Wait for the host to start the game

### Solo Mode

1. Click "Solo Game" on the home screen
2. Use the scoreboard controls to track points

### Scoring

- Use the +1 and +3 buttons to add points
- Use "BUST" button to reset a team's score when they go over
- Use "Math Mode" to calculate points based on bags on board and in hole
- Use the manual override to set an exact score for a team

## Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` folder, ready to deploy to any static hosting service.

### Deploy to GitHub Pages

1. Update the `base` option in `vite.config.ts` to match your repository name:
```typescript
base: '/cornpanion/' // Replace with your repo name
```

2. Build the project:
```bash
npm run build
# or
yarn build
```

3. Deploy to GitHub Pages:
```bash
npm run deploy
# or
yarn deploy
```

## Technologies Used

- React 19
- TypeScript
- Firebase Realtime Database
- Jotai for state management
- React Router for navigation
- Vite for build tooling
- PWA capabilities via Vite PWA plugin

## License

This project is licensed under the MIT License

## Acknowledgments

- Inspired by the need for a digital scoreboard for cornhole games
- Thanks to the cornhole community for feedback and feature ideas
