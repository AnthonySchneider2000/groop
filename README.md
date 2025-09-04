# Groop

A collaborative infinite canvas application built with Next.js that allows users to create, organize, and nest interactive cards in a zoomable workspace.

## ✨ Features

- **Infinite Canvas**: Large, pannable and zoomable workspace (5000x5000px) for unlimited creativity
- **Interactive Cards**: Create and manage draggable cards with editable content
- **Nested Organization**: Drag cards into other cards to create hierarchical structures
- **Smart Drag & Drop**: Advanced drag and drop with visual feedback and intelligent nesting
- **Canvas Controls**: Zoom in/out, pan around, and reset view with intuitive controls
- **Theme Support**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly across different screen sizes
- **Modern UI**: Clean, accessible interface built with shadcn/ui components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AnthonySchneider2000/groop.git
cd groop
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🎯 Usage

### Creating Cards
- **Double-click** anywhere on the canvas to create a new card at that position
- Cards are created with a default title that you can edit by clicking on them

### Moving Cards
- **Click and drag** any card to move it around the canvas
- Cards can be moved freely within the infinite workspace

### Nesting Cards
- **Drag one card onto another** to nest it as a child
- Child cards move relative to their parent when the parent is moved
- **Drag a child card outside its parent** to ungroup it and make it independent

### Canvas Navigation
- **Mouse wheel** or trackpad to zoom in and out
- **Click and drag** on empty canvas area to pan around
- **Reset button** in the top-right to return to the original view
- **Theme toggle** to switch between light and dark modes

### Card Selection
- **Click on a card** to select it (visual highlight)
- **Click on empty canvas** to deselect all cards

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Canvas Interaction**: [react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch)
- **State Management**: React hooks with useImmer
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

## 📁 Project Structure

```
groop/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page with canvas
│   └── globals.css              # Global styles
├── components/
│   ├── canvas/                  # Canvas-related components
│   │   ├── InfiniteCanvas.tsx   # Main canvas component
│   │   ├── Card.tsx             # Individual card component
│   │   └── CanvasControls.tsx   # Canvas control buttons
│   ├── providers/               # React context providers
│   │   └── CardsProvider.tsx    # State management for cards
│   ├── ui/                      # shadcn/ui components
│   └── theme-provider.tsx       # Theme context provider
├── lib/
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
└── hooks/
    └── use-mobile.ts            # Mobile detection hook
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

### Code Quality

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling
- **Conventional commits** for commit message formatting

## 🚀 Deployment

The easiest way to deploy your Groop application is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details on other deployment options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and not currently open for public contributions.

## 🔗 Links

- [Live Demo](https://groop-canvas.vercel.app) *(if deployed)*
- [GitHub Repository](https://github.com/AnthonySchneider2000/groop)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
