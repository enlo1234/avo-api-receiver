# Avo Event Schema Receiver Interface

A beautiful, production-ready React application for fetching and displaying event schemas from Avo's API. Built with modern web technologies and designed with attention to detail.

## Features

- 🎨 **Beautiful UI Design** - Clean, modern interface with thoughtful animations and micro-interactions
- 🔐 **Secure Authentication** - Support for Basic Authentication with service account credentials
- 🛠️ **Advanced Debugging** - Built-in debug tools with curl command generation and verbose output
- 📱 **Responsive Design** - Optimized for all screen sizes from mobile to desktop
- 🚀 **Production Ready** - Built with TypeScript, proper error handling, and best practices
- 🔧 **CORS Solution** - Includes Vite proxy configuration to bypass browser CORS restrictions

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **ESLint** for code quality

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd avo-schema-receiver
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Basic Setup

1. **Enter your Avo API endpoint** in the format:
   ```
   https://api.avo.app/workspaces/YOUR_WORKSPACE_ID/branches/YOUR_BRANCH_ID/export/v1
   ```

2. **Add your service account credentials** (if required):
   - Service Account Name
   - Service Account Secret

3. **Click "Fetch Schema"** to retrieve your event schema

### Finding Your Workspace and Branch IDs

#### Workspace ID
1. Log into your Avo dashboard
2. Look at the URL: `https://app.avo.app/workspaces/[WORKSPACE_ID]/...`
3. The Workspace ID is the part after `/workspaces/`

#### Branch ID
1. Navigate to the branch you want in your Avo dashboard
2. Look at the URL: `https://app.avo.app/workspaces/[WORKSPACE_ID]/branches/[BRANCH_ID]/...`
3. The Branch ID is the part after `/branches/`
4. Common branch names: `main`, `master`, `production`

### Troubleshooting

The application includes comprehensive troubleshooting guides and debug tools:

- **Debug Information Panel** - Shows HTTP response details
- **Curl Command Generator** - Provides exact curl commands for testing
- **Error Messages** - Detailed error descriptions with suggested solutions
- **CORS Proxy** - Built-in proxy to handle CORS issues in development

## API Endpoints

The application supports various Avo API endpoint formats:

- `https://api.avo.app/workspaces/[ID]/branches/[ID]/export/v1`
- `https://api.avo.app/workspaces/[ID]/branches/[ID]/export`
- `https://api.avo.app/workspaces/[ID]/branches/[ID]/schema`
- `https://api.avo.app/v1/workspaces/[ID]/branches/[ID]/export`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── App.tsx              # Main application component
├── main.tsx            # Application entry point
├── index.css           # Global styles with Tailwind
└── components/         # Reusable components (future expansion)
```

### Key Features Implementation

#### CORS Handling
The application uses Vite's proxy configuration to handle CORS issues:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://api.avo.app',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: true
    }
  }
}
```

#### Authentication
Basic Authentication is implemented with proper Base64 encoding:

```typescript
const encodeBasicAuth = (username: string, password: string): string => {
  return btoa(`${username}:${password}`);
};
```

#### Error Handling
Comprehensive error handling with specific guidance for common issues:

- 404 errors with workspace/branch ID guidance
- 401/403 authentication errors
- Network and CORS issues

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for integration with [Avo](https://avo.app) event tracking platform
- Icons provided by [Lucide React](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)