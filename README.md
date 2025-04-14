# XX Network Secure Extension

A browser extension that enhances security when interacting with xx.network applications, specifically designed to work with [Haven](https://haven.xx.network/), the xx.network chat application.

## What is This Extension?

This secure extension serves as a security layer for xx.network applications, providing:

- Secure key-value (KV) data storage for Haven chat
- The ability to import, export, and wipe your KV data
- Enhanced data persistence and portability across browsers
- A more secure alternative to Haven's default browser local storage

## How It Works

The extension works hand-in-hand with the Haven chat application (https://haven.xx.network/):

1. By default, Haven uses your browser's local storage to store key-value (KV) data
2. This extension allows you to store that KV data in the extension's storage instead
3. Your data becomes portable - you can import/export KV data between browsers or devices
4. You gain the ability to completely wipe your KV data when needed

The extension uses secure browser extension APIs to handle sensitive data and provides a simple user interface to manage your stored information.

## Key Features

- **Secure Storage**: Move KV data from browser local storage to more secure extension storage
- **Data Portability**: Import and export your KV data between browsers or devices
- **Data Control**: Easily wipe your data when needed
- **Seamless Integration**: Works directly with Haven chat with minimal configuration

## Installation

### For Users

1. Clone this repository:
   ```
   git clone https://github.com/xx-network/xxnetwork-secure-extension.git
   ```

2. Build the extension:
   ```
   cd xxnetwork-secure-extension
   pnpm install
   pnpm build
   ```

3. Load the extension in your browser:
   - Chrome/Edge:
     - Go to `chrome://extensions/`
     - Enable "Developer mode"
     - Click "Load unpacked"
     - Select the `dist` folder from this project
   - Firefox:
     - Go to `about:debugging#/runtime/this-firefox`
     - Click "Load Temporary Add-on..."
     - Select any file in the `dist` folder

4. Visit [Haven](https://haven.xx.network/) and the extension will automatically integrate with it

### For Developers

1. Clone the repository
   ```
   git clone https://github.com/xx-network/xxnetwork-secure-extension.git
   ```

2. Install dependencies
   ```
   cd xxnetwork-secure-extension
   pnpm install
   ```

3. Start the development server
   ```
   pnpm dev
   ```

4. Load the extension in your browser from the `dist` folder as described above

## Development Workflow

This project uses:
- Svelte 5 for UI components
- TypeScript for type safety
- Vite for fast builds
- ESLint and Prettier for code quality
- Lefthook for git hooks

Useful commands:
- `pnpm dev` - Run development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type check the codebase

## Structure

- `/src` - Source code
  - `/components` - Reusable Svelte components
  - `/extension` - Extension-specific code
  - `/routes` - Page routes
- `/public` - Static assets
- `/dist` - Build output






