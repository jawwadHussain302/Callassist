# Call Support Assistant

A desktop application built with Tauri and React for managing and processing call support interactions.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CallSupportAssistant.git
cd CallSupportAssistant
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Rust dependencies (if not already installed):
```bash
rustup update
```

## Development

To run the application in development mode:

```bash
npm run tauri dev
```

## Building

To build the application:

```bash
npm run tauri build
```

## Project Structure

- `src/` - React frontend source code
- `src-tauri/` - Tauri backend source code
- `public/` - Static assets
- `audio_uploads/` - Directory for audio file uploads
- `whisper/` - Whisper-related functionality

## Dependencies

### Frontend Dependencies
- React 18.3.1
- Tauri API 1.5.3

### Development Dependencies
- TypeScript 5.6.2
- Vite 6.0.3
- Tauri CLI 1.5.9
- React Types
- Vite React Plugin

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
