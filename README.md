# D1 Leadership AI Deep Dive

**Interactive Presentation Application**

An interactive, collaborative presentation platform for delivering comprehensive 2-hour technical deep dives covering Dynatrace architectures, service challenges, AI capabilities, and organizational vision.

## Overview

This Dynatrace ESA application provides:

- **Password Protection**: Secure access with password authentication (Password: `AiDeepDive`)
- **Cinematic Intro**: Elegant splash screen with inspirational AI quote
- **Chevron Navigation**: Visual progress tracking across 8 major modules
- **Hierarchical Content**: Topic-based navigation with expandable subtopics
- **Rich Content Display**: Markdown rendering with callouts, code blocks, and diagrams
- **Progress Tracking**: Automatic completion tracking and time estimates
- **Bookmarks & Notes**: Personal annotation and reference system
- **Search Functionality**: Quick navigation to specific topics
- **Responsive Design**: Adapts to various screen sizes
- **Dynatrace Strato Components**: Pre-configured with the Dynatrace design system
- **TypeScript Support**: Fully typed for better development experience

## Getting Started

### 1. Copy This Template

```bash
# Copy this entire directory to start a new project
cp -r DYNATRACE1-ESA-APP-DEEPDIVE YOUR-NEW-APP-NAME
cd dynatrace1-esa-app-deepdive
```

### 2. Update Configuration

Edit `app.config.json` to customize your app:

```json
{
  "app": {
    "id": "my.d1esa.dynatrace.deepdive",
    "name": "Deep Dive Presents (D1-ESA)",
    "version": "1.0.0",
    "description": "Your app description"
  }
}
```

Edit `package.json` to update the project name:

```json
{
  "name": "your-app-name",
  "description": "Your app description"
}
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build and Deploy

```bash
# Build the app
npm run build

# Deploy to Dynatrace environment
npm run deploy
```

## Project Structure

```
├── app.config.json               # App configuration and metadata
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── main.tsx                      # Entry point for dt-app
├── PRD.md                        # Product Requirements Document
├── docs/                         # Documentation
│   ├── TechnicalArchitecture.md  # Technical architecture details
│   ├── Wireframes_UI_Mockups.md  # UI/UX specifications
│   └── PulseBoard_CustomerSignalFabric.md  # CCO PulseBoard vision
├── src/                          # Backend app functions
│   ├── functions/                # Dynatrace app functions
│   │   ├── query-grail.ts        # DQL query execution
│   │   ├── get-metrics.ts        # Metrics API
│   │   └── get-entities.ts       # Entities API
│   └── assets/                   # Static assets
└── ui/                           # Frontend React application
    ├── index.html                # HTML entry point
    └── app/
        ├── index.tsx             # React entry point
        ├── App.tsx               # Main App component
        ├── styles.css            # Global styles
        ├── types/                # TypeScript type definitions
        │   └── content.ts        # Content type definitions
        ├── data/                 # Application data
        │   ├── modules.ts        # Module configurations
        │   ├── topics.ts         # Topic definitions
        │   └── content.ts        # Topic content
        ├── pages/                # Page components
        │   ├── DeepDivePresentation.tsx  # Main presentation page
        │   └── Dashboard.tsx     # Original dashboard (legacy)
        ├── components/           # Reusable components
        │   ├── ChevronNavigation.tsx  # Top module navigation
        │   ├── Sidebar.tsx       # Left sidebar navigation
        │   ├── ContentArea.tsx   # Main content display
        │   └── MetricCard.tsx    # Metric display card
        ├── hooks/                # Custom React hooks
        └── utils/                # Utility functions
```

## Presentation Modules

The application covers 8 major modules designed for a comprehensive 2-hour presentation:

1. **Platforms & Challenges** (20 min)
   - Dynatrace Managed Offline
   - Dynatrace Managed + PHA
   - Dynatrace SaaS Classic
   - Dynatrace SaaS Gen3

2. **Service Challenges** (25 min)
   - Case studies: Accenture, Academy, Shell, GM, FRIT & BOA, American Airlines
   - Solution Architect, Services Consultant, and Account Team challenges

3. **AI Crash Course** (30 min)
   - AI mindset and organizational readiness
   - Security considerations and private hosting (Ollama)
   - RAG, chunking, embeddings, and knowledge graphs
   - Claude Projects, skills, and agents

4. **App Building Demo** (15 min)
   - App template overview
   - Volumetric Explorer case study (Best Buy)

5. **Splunk Migration** (25 min)
   - Migration challenges and complexity
   - SPL to DQL conversion
   - DynaBridge for Splunk workflow

6. **DynaBridge Vision** (10 min)
   - Platform expansion strategy
   - Workflow consistency across platforms

7. **Vision** (20 min)
   - Customer Solutions & AI Engineering vision
   - Forge Initiative
   - LangGraph architecture
   - CCO PulseBoard: Customer Signal Fabric

8. **Q&A** (15 min)
   - Open discussion and next steps

## Features

### Navigation
- **Top Chevron Bar**: Click any module to jump directly to that section
- **Progress Indicators**: Visual progress bars show completion status
- **Sidebar Topics**: Hierarchical topic navigation within each module
- **Breadcrumbs**: Track your current location in the presentation

### Content Management
- **Bookmarks**: Save important topics for quick reference
- **Notes**: Add personal notes to any topic
- **Search**: Quickly find specific topics across all modules
- **Related Topics**: Navigate to related content easily

### Progress Tracking
- **Automatic Tracking**: Topics marked complete when viewed
- **Time Estimates**: See estimated time remaining for each module
- **Persistent State**: Progress saved locally and restored on return

## Customization Guide

### Adding New Modules

Edit `ui/app/data/modules.ts`:

```typescript
{
  id: 'new-module',
  title: 'New Module',
  description: 'Module description',
  duration: 15,
  order: 9,
  icon: 'icon-name',
  color: '#hexcolor'
}
```

### Adding New Topics

Edit `ui/app/data/topics.ts`:

```typescript
'module-id': [
  {
    id: 'topic-id',
    title: 'Topic Title',
    contentFile: 'topic-file.md',
    duration: 5,
    order: 1,
    tags: ['tag1', 'tag2'],
    relatedTopics: ['related-topic-id']
  }
]
```

### Adding Content

Edit `ui/app/data/content.ts`:

```typescript
'topic-id': {
  id: 'topic-id',
  title: 'Topic Title',
  type: 'markdown',
  content: `Your markdown content here...`,
  metadata: {
    duration: 5,
    tags: ['Topic Tags'],
    relatedTopics: ['Related Topics']
  }
}
```

### Old Dashboard (Legacy)

### Adding New Tabs

In `ui/app/pages/Dashboard.tsx`, add new tabs by:

1. Adding a new tab type to the state:
```typescript
const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3' | 'tab4'>('tab1');
```

2. Adding a new tab button:
```tsx
<Button onClick={() => setActiveTab('tab4')}>Tab 4</Button>
```

3. Adding the tab content:
```tsx
{activeTab === 'tab4' && (
  <Container>
    {/* Your content here */}
  </Container>
)}
```

### Modifying the DQL Query

Update the default query in `ui/app/pages/Dashboard.tsx`:

```typescript
const [dql, setDql] = React.useState<string>(`fetch logs
| filter <your conditions>
| limit 100`);
```

### Adding New Components

Create new components in `ui/app/components/` and import them into your pages:

```typescript
import { YourComponent } from '../components/YourComponent';
```

### Backend Functions

Backend functions in `src/functions/` are automatically registered and can be called from the UI using the Dynatrace SDK.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run deploy` - Deploy to Dynatrace environment
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Requirements

- Node.js >= 20.0.0
- Dynatrace environment with Gen3 Apps enabled

## Documentation

- [Dynatrace Apps Documentation](https://www.dynatrace.com/support/help/platform/apps)
- [DQL Query Language](https://www.dynatrace.com/support/help/platform/grail/dynatrace-query-language)
- [Strato Design System](https://design.dynatrace.com/)

## Support

For questions or issues, contact the D1-ESA team.

## License

Internal use only - D1 Enterprise Solutions & Architecture

## SharePoint Content Integration

The app supports loading content dynamically from SharePoint at runtime, allowing you to update content without rebuilding/redeploying the app.

### Key Features

- **Runtime Content Loading**: Fetch markdown content from SharePoint when users navigate
- **Automatic Caching**: Content is cached in memory to minimize requests
- **Automatic Fallback**: If SharePoint is unavailable, falls back to local bundled content
- **Easy Configuration**: Simple URL mapping in config file
- **No Rebuild Required**: Update content in SharePoint and users see changes immediately

### Quick Setup

1. **Upload .md files to SharePoint** with appropriate read permissions
2. **Configure URLs** in `/ui/app/config/sharepoint.ts`:
   ```typescript
   export const SHAREPOINT_CONTENT = {
     'rag-fundamentals': {
       id: 'rag-fundamentals',
       url: 'https://yourorg.sharepoint.com/.../rag-fundamentals.md',
       title: 'RAG, Chunking & Embeddings',
       type: 'markdown'
     },
     // Add more topics...
   };
   ```
3. **Enable SharePoint** by setting `USE_SHAREPOINT_CONTENT = true`
4. **Rebuild and deploy** the app

### Documentation

For detailed setup instructions, CORS configuration, authentication, and troubleshooting, see:
- **[SharePoint Setup Guide](docs/SHAREPOINT_SETUP.md)**

### Important Notes

- Users must have SharePoint read permissions for the content files
- Users should be authenticated to SharePoint in their browser before accessing the app
- CORS may need to be configured by your SharePoint administrator
- Currently disabled by default (`USE_SHAREPOINT_CONTENT = false`)

