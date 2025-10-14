# Project Summary
DreamTales is an innovative bilingual web application that creates personalized bedtime stories for children in both English and Danish. Users can customize characters by uploading photos, select themes, and influence story content through keywords. The platform enhances bedtime routines with engaging storytelling and community interaction, allowing users to save and share their stories. It integrates advanced AI capabilities, generating Disney/Pixar-style characters based on user-uploaded photos, with a localStorage-first approach for offline usage and optional cloud saves via Supabase. Recent updates include improved avatar generation, enhanced error handling, a Public Library, and a Sharing Board for community interactions. The application now features user authentication and has resolved a router context error to improve navigation, ensuring the homepage reflects the updated design.

# Project Module Description
- **User Authentication**: The application requires wrapping in an AuthProvider for authentication-dependent features.
- **Character Creation**: Users can create and customize characters by uploading photos and generating AI avatars.
- **AI Story Generation**: Generates stories using OpenAI's GPT model based on user inputs, ensuring a valid JSON response.
- **Image Generation**: Creates illustrations using OpenAI's DALL-E API based on story content.
- **Bilingual Support**: Supports both English and Danish languages.
- **Story Library**: Users can save and access their generated stories without logging in.
- **Story Sharing**: Facilitates publishing stories for others to read.
- **Avatar Generation**: Uses AI to create high-quality animated avatars based on uploaded photos with enhanced likeness preservation.
- **Gender Selection**: Users can select a gender for their character to guide the AI in generating accurate representations.
- **Supabase Integration**: Connects to Supabase for managing character and story persistence, with required tables and policies set for development.
- **Public Library**: A local-only feature for browsing and importing creature templates.
- **Public Sharing Board**: Allows users to create posts, share excerpts, and like others' posts, with all data stored locally.
- **Local-Only Persistence**: All data is stored in localStorage, ensuring no cross-user public backend until Supabase is enabled.

# Directory Tree
```
shadcn-ui/
├── README.md                 # Comprehensive project documentation for local setup
├── .env.example              # Example environment variables file including OpenAI API key
├── components.json           # Configuration for components
├── eslint.config.js          # ESLint configuration file
├── index.html                # Main HTML file
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── public/
│   ├── favicon.svg           # Website favicon
│   └── robots.txt            # Robots.txt for search engines
├── src/
│   ├── App.css               # Main CSS styles
│   ├── App.tsx               # Main application component with routes, including user authentication
│   ├── contexts/             # Contexts for state management
│   ├── components/ui/        # UI components (e.g., buttons, dialogs)
│   ├── components/story/     # Story-related components
│   ├── components/layout/     # Layout components (e.g., Navbar)
│   ├── components/character/  # Character creation components including AI avatar generator
│   ├── hooks/                # Custom hooks for functionality
│   ├── pages/                # Application pages (e.g., Index, CreateStory, Home, PublicLibrary, PublicBoard, Generate)
│   ├── lib/                  # Utility functions and API clients
│   ├── index.css             # Main CSS file with styles, updated for dark blue theme and starfield
│   ├── lib/openai.ts         # OpenAI API integration for story and avatar generation
│   ├── lib/supabase.ts       # Supabase client for database interactions
│   ├── lib/storage.ts        # Local storage helpers for JSON data
│   └── main.tsx              # Entry point for the application
├── tailwind.config.ts        # Tailwind CSS configuration
├── template_config.json      # Template configuration
├── tsconfig.*                # TypeScript configuration files
└── vite.config.ts            # Vite configuration for building
└── docs/
    └── prompts/
        └── story_generation_prompt.md # Documentation for the story generation prompt template
    └── public/
        └── local_only_library_board.md # Documentation for local-only Library and Sharing Board
```

# File Description Inventory
- **README.md**: Overview, setup instructions, and database schema for the project, including local export and run guide.
- **.env.example**: Template for required environment variables, including OpenAI API key.
- **package.json**: Lists project dependencies and scripts.
- **src/**: Contains the source code of the application, including components, pages, and styles.
- **vite.config.ts**: Configuration for Vite, the build tool used in the project.
- **src/lib/openai.ts**: Integration for story and avatar generation using OpenAI API, including prompt assembly for story generation.
- **src/lib/supabase.ts**: Supabase client for managing character and story persistence, includes error handling for missing environment variables.
- **src/lib/storage.ts**: Local storage helpers for JSON data.
- **src/components/character/AvatarGenerator.tsx**: Component for generating avatars using AI, with enhanced error handling for image generation.
- **src/types/index.ts**: Includes character photo types and user preferences.
- **src/components/layout/Navbar.tsx**: Navigation bar component, simplified to always show links without login requirements.
- **src/components/story/GenerateStory.tsx**: Component for generating stories based on user input and selected characters, now includes robust error handling.
- **src/pages/CreateStory.tsx**: Page for creating and customizing stories.
- **src/pages/Home.tsx**: New homepage featuring a starry dark-blue gradient background with magical characters and CTAs for character creation and story generation.
- **src/pages/PublicLibrary.tsx**: New page for browsing and importing creature templates.
- **src/pages/PublicBoard.tsx**: New page for sharing posts and liking others' posts.
- **src/pages/Generate.tsx**: New page for generating stories.
- **src/assets/avatar_placeholder.svg**: Neutral silhouette used as a fallback when avatar generation fails.
- **docs/prompts/story_generation_prompt.md**: Documentation detailing the exact story generation prompt used, including message order and parameters.

# Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: OpenAI API for image generation and Supabase for database management
- **Build Tool**: Vite
- **Linting**: ESLint
- **AI Integration**: OpenAI API for story and image generation
- **Local Storage**: For persistence of data without a backend.

# Usage
1. Clone the repository.
2. Install dependencies using:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file in the project root with the OpenAI API key and settings for story generation:
   ```bash
   VITE_OPENAI_API_KEY=sk-your-key
   VITE_OPENAI_MODEL=gpt-4o-mini
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1
   ```
4. Start the development server with:
   ```bash
   pnpm dev
   ```
