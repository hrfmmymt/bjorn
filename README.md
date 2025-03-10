# Bjorn - Book & Music Collection Manager

Bjorn is a web application for managing personal book and music collections. You can easily add items using the barcode scanning feature, rate them, and organize your collection.

<img width="1294" alt="スクリーンショット 2025-03-04 0 54 09" src="https://github.com/user-attachments/assets/0706a07f-8ef6-410c-8e98-4977087aa650" />

## Features

- Authentication with Google account
- Add, edit, and delete items (books & music)
- Automatic information retrieval via barcode scanning
- Item search functionality
- 6-level rating system

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Supabase (authentication & database)
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Libraries**:
  - react-router-dom: Routing
  - @zxing/library: Barcode scanning
  - react-icons: Icons
  - @testing-library/react: Testing

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm 10 or higher
- Supabase account
- Google OAuth configuration
- Discogs API Token (for music information retrieval)

### Environment Variables

Create a `.env` file in the project root and set the following environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DISCOGS_TOKEN=your_discogs_api_token
VITE_PRODUCTION_URL=your_production_url
```

### Installation and Running

```
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Format code
pnpm format

# Lint code
pnpm lint
```

## Deployment

Deploy the `dist` directory after building to your preferred hosting service (Vercel, Netlify, Firebase Hosting, etc.).

## License

MIT
