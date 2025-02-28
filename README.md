# create-react-tailwind-app

A modern CLI tool to quickly scaffold a new React 19 project with Tailwind CSS v4 using Vite as the build tool.

## Features

- ⚛️ React 19 with the latest features
- 🎨 Tailwind CSS v4 pre-configured
- ⚡ Lightning-fast builds with Vite
- 🔄 TypeScript support (optional)
- 📦 Works with npm, yarn, or pnpm
- 🚀 Zero configuration setup
- 💅 Includes sample component to demonstrate Tailwind usage

## Installation

### Global Installation (recommended)

```bash
npm install -g @ksol8/create-react-tailwind-app
```

### Using npx (no installation required)

```bash
npx @ksol8/create-react-tailwind-app my-app
```

## Usage

### Interactive Mode

Run the CLI tool and follow the prompts:

```bash
create-react-tailwind-app
```

Or specify a project name directly:

```bash
create-react-tailwind-app my-awesome-app
```

### Non-Interactive Mode

Use the `-y` flag to skip all prompts and use defaults (TypeScript enabled, npm as package manager):

```bash
create-react-tailwind-app my-app -y
```

## Options

| Option           | Description                       |
| ---------------- | --------------------------------- |
| `[project-name]` | Name of your project (optional)   |
| `-y, --yes`      | Skip all prompts and use defaults |
| `-v, --version`  | Output the version number         |

## Project Structure

The generated project includes:

- React 19 configured with Vite
- Tailwind CSS v4 with PostCSS
- Sample component demonstrating Tailwind usage
- Ready-to-use project structure

## Requirements

- Node.js 16.x or higher
- npm, yarn, or pnpm

## Development

To contribute to this project:

1. Clone the repository
2. Install dependencies: `npm install`
3. Link the package locally: `npm link`
4. Now you can run `create-react-tailwind-app` locally

## License

ISC © [Kuldeep Solanki](mailto:kuldeepsolanki1854@gmail.com)
