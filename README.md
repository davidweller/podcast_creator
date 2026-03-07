# Cozy Crime Creator Suite

Transform historical research into publish-ready Cozy Crime scripts and assets.

## Features

- **Project Management**: Create, manage, and duplicate projects
- **Research Input**: Paste and save historical research with auto-save
- **Script Generation**: Generate 30-minute and 90-minute scripts with automated validation
- **YouTube Description**: Generate SEO-optimized descriptions with timestamps
- **Shorts Generator**: Create YouTube Shorts trailer scripts
- **Title & Metadata**: Generate episode titles, summaries, keywords, and tags
- **Image Prompt Generator**: Create AI image prompts for background visuals

## Setup

### Prerequisites

- Node.js 18+ and npm
- Anthropic Claude API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Create a Project**: Click "Create New Project" and enter a case title and era/location
2. **Add Research**: Navigate to the Research tab and paste your historical research
3. **Generate Scripts**: Use the Script Generator tab to create 30-minute or 90-minute scripts
4. **Generate Assets**: Use the other tabs to generate descriptions, shorts, metadata, and image prompts
5. **Download**: Download any generated content as TXT files

## Project Structure

```
cozycrime/
├── app/                    # Next.js App Router
│   ├── (workspace)/        # Project workspace routes
│   ├── api/                # API routes
│   └── layout.tsx          # Root layout
├── components/             # React components
├── lib/                    # Utilities & business logic
│   ├── db/                 # Database operations
│   ├── prompts/            # Locked master prompts
│   ├── validation/         # Validation engine
│   ├── claude/             # Claude API client
│   └── generation/         # Generation engines
├── types/                  # TypeScript definitions
└── data/                   # SQLite database (created automatically)
```

## Database

The app uses SQLite for local storage. The database file is created automatically in the `data/` directory when you first run the app.

## Script Validation

Scripts are automatically validated against Cozy Crime standards:
- Word count compliance
- Chapter structure
- Tone and language checks
- CTA placement
- Closing ritual format

If validation fails, the system automatically regenerates the script up to 3 times with correction instructions.

## Prompts

All prompts are locked and stored in `lib/prompts/`. The 90-minute script uses a two-stage pipeline: narrative architecture planning followed by full script generation, both based on the Descending Spiral template in `cozy_crime_template.md`.

## Building for Production

```bash
npm run build
npm start
```

## License

ISC
