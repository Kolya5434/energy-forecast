# Energy Forecast

**Advanced Machine Learning-based Energy Consumption Forecasting Platform**

A modern, production-ready web application for forecasting energy consumption using multiple machine learning models. Built with React, TypeScript, and Material-UI, featuring real-time predictions, model evaluation, interpretation tools, and interactive visualizations.

---

## Features

### Core Functionality
- **Multi-Model Forecasting** - Support for 15+ ML models (Classical, ML, DL, Ensemble)
- **Real-time Predictions** - Generate forecasts with configurable time horizons
- **Interactive Visualizations** - 12 chart types including line, bar, area, radar, heatmap
- **Model Evaluation** - Comprehensive metrics (MAE, RMSE, R2, MAPE, Explained Variance)
- **Feature Importance Analysis** - Understand which features drive predictions
- **SHAP Force Plots** - Detailed interpretability for individual predictions
- **What-If Simulation** - Test scenarios with custom feature values
- **Export Capabilities** - Export results to Excel, Word, and PDF formats

### Technical Highlights
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme** - User-selectable theme with smooth transitions
- **Modular Architecture** - Component-based structure with 9 specialized sub-components
- **TypeScript** - Full type safety and IntelliSense support
- **Internationalization Ready** - i18next integration for multi-language support
- **Comprehensive Testing** - Unit tests with Vitest and Testing Library
- **Performance Optimized** - Code splitting, lazy loading, optimized bundle size

---

## Tech Stack

### Frontend
- **Framework:** React 19.2 + TypeScript 5.9
- **Build Tool:** Vite 7.2
- **UI Library:** Material-UI (MUI) 7.3
- **Charts:** Recharts 3.2, ECharts 6.0
- **Styling:** SCSS Modules with modern `@use` syntax
- **Forms:** React Hook Form 7.65
- **Date Handling:** Day.js 1.11 + MUI Date Pickers

### State & Data Management
- **HTTP Client:** Axios 1.12
- **Context API:** Custom ApiProvider for global state
- **Internationalization:** i18next 25.6, react-i18next 16.0

### Development Tools
- **Linting:** ESLint 9.36 with TypeScript support
- **Testing:** Vitest 4.0, Testing Library, MSW 2.11
- **Formatting:** Prettier 3.6 with import sorting
- **Type Checking:** TypeScript with strict mode

### Export & Documents
- **Excel:** XLSX 0.18
- **PDF:** jsPDF 3.0 with AutoTable 5.0
- **Word:** Docx 9.5

---

## Project Structure

```
energy-forecast/
├── src/
│   ├── api/                    # API integration layer
│   │   ├── fetchModels.ts      # GET /api/models
│   │   ├── postPredictions.ts  # POST /api/predict
│   │   ├── fetchEvaluation.ts  # GET /api/evaluate
│   │   ├── fetchInterpretation.ts  # GET /api/interpret
│   │   └── postSimulation.ts   # POST /api/simulate
│   ├── config/
│   │   └── axios.ts            # Axios instance configuration
│   ├── context/
│   │   ├── ApiContext.tsx      # Global API state provider
│   │   └── useApi.tsx          # Custom API hook
│   ├── helpers/
│   │   ├── utils.ts            # Utility functions
│   │   ├── exportToFile.ts     # Export functionality
│   │   └── exportEvaluationUtils.ts  # Evaluation export helpers
│   ├── pages/
│   │   ├── components/         # Page sub-components
│   │   │   ├── charts/         # Chart-related components
│   │   │   │   ├── ChartRenderer.tsx
│   │   │   │   ├── ModelSelector.tsx
│   │   │   │   └── ChartControls.tsx
│   │   │   ├── evaluation/     # Evaluation components
│   │   │   │   ├── MetricsTable.tsx
│   │   │   │   ├── ComparisonChart.tsx
│   │   │   │   ├── ErrorAnalysis.tsx
│   │   │   │   └── ExportButtons.tsx
│   │   │   └── interpretation/ # Interpretation components
│   │   │       ├── FeatureImportanceChart.tsx
│   │   │       └── FeatureImportanceTable.tsx
│   │   ├── MainContent.tsx     # Forecast view (147 lines)
│   │   ├── EvaluationContent.tsx  # Model evaluation view (275 lines)
│   │   ├── InterpretContent.tsx   # Feature importance view (118 lines)
│   │   ├── ShapForcePlot.tsx   # SHAP visualization
│   │   ├── SimulationContent.tsx  # What-if scenarios
│   │   ├── HelpContent.tsx     # Documentation & help
│   │   ├── Header.tsx          # Top navigation bar
│   │   └── SidePanel.tsx       # Model selection sidebar
│   ├── shared/
│   │   └── constans.ts         # Application constants
│   ├── styles/
│   │   ├── variables.scss      # SCSS variables
│   │   └── mixins.scss         # SCSS mixins
│   ├── types/
│   │   ├── api.ts              # API type definitions
│   │   └── shared.ts           # Shared types
│   ├── App.tsx                 # Root application component
│   ├── main.tsx                # Application entry point
│   └── i18n.ts                 # Internationalization config
├── __tests__/                  # Test suites
│   └── api/                    # API tests
│       ├── models.test.ts
│       ├── predictions.test.ts
│       ├── evaluation.test.ts
│       ├── interpretation.test.ts
│       └── simulation.test.ts
├── public/                     # Static assets
├── theme.tsx                   # MUI theme configuration
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest test configuration
├── tsconfig.json               # TypeScript configuration
├── .env                        # Environment variables
└── package.json                # Dependencies & scripts
```

### Component Architecture

After refactoring (see `REFACTORING_SUMMARY.md`):
- **63% code reduction** in large page components
- **9 new specialized sub-components** created
- **Modular SCSS** with responsive breakpoints (1920px, 1200px, 768px, 480px)
- **Single Responsibility Principle** applied throughout

---

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (or npm/yarn)
- **Backend API** - Energy forecast API server running

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd energy-forecast
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Local development
VITE_API_ENDPOINT=http://localhost:8000

# Or use production endpoints
# VITE_API_ENDPOINT=https://mykola121-energy-forecast-api.hf.space
# VITE_API_ENDPOINT=https://energy-forecast-server-1.onrender.com
```

---

## Development

### Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

---

## Testing

### Run All Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Test with UI

```bash
pnpm test:ui
```

### Coverage Report

```bash
pnpm test:coverage
```

### Run Specific Test Suites

```bash
pnpm test:models         # Test model fetching
pnpm test:predictions    # Test prediction API
pnpm test:evaluation     # Test evaluation API
pnpm test:interpretation # Test interpretation API
pnpm test:simulation     # Test simulation API
```

---

## API Integration

The application communicates with a backend API. All API calls are centralized in the `src/api/` directory.

### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/models` | GET | Fetch available ML models |
| `/api/predict` | POST | Generate forecasts for selected models |
| `/api/evaluate` | GET | Get model evaluation metrics |
| `/api/interpret` | GET | Get feature importance analysis |
| `/api/simulate` | POST | Run what-if simulation scenarios |

### API Types

All API request/response types are defined in `src/types/api.ts`:

- `ModelsApiResponse` - Available models list
- `IPredictionRequest` / `IPredictionResponse` - Forecast generation
- `IEvaluationApiResponse` - Model metrics and error analysis
- `IInterpretationApiResponse` - Feature importance data
- `ISimulationRequest` - Scenario simulation input

### Configuration

API base URL is configured via environment variable `VITE_API_ENDPOINT` (see `src/config/axios.ts`).

---

## Application Views

### 1. Forecast View (`MainContent`)
- Select multiple models from sidebar
- Configure forecast horizon (1-365 days)
- Generate and visualize predictions
- Switch between 12 chart types
- Export results

### 2. Evaluation View (`EvaluationContent`)
- Compare model performance metrics
- View error analysis (residuals, monthly stats, scatter plots)
- Sort and filter metrics
- Export to Excel/Word/PDF

### 3. Interpretation View (`InterpretContent`)
- Analyze feature importance
- Visualize with 5 chart types (bar, line, scatter, radar)
- View detailed importance table with percentages

### 4. SHAP Force Plot View (`ShapForcePlot`)
- Individual prediction interpretation
- Feature contribution visualization
- Base value vs predicted value comparison

### 5. Simulation View (`SimulationContent`)
- Run what-if scenarios
- Override feature values
- Compare baseline vs simulated forecasts

### 6. Help View (`HelpContent`)
- User documentation
- Feature explanations
- Usage guides

---

## Chart Types

The application supports 12 interactive chart types:

1. **Line Chart** - Standard time series
2. **Smooth Line** - Monotone interpolation
3. **Step Chart** - Step-after interpolation
4. **Area Chart** - Filled area
5. **Stacked Area** - Multiple areas stacked
6. **Bar Chart** - Horizontal bars
7. **Vertical Bar** - Vertical bars
8. **Stacked Bar** - Stacked bars
9. **Composed Chart** - Combination of line and bar
10. **Scatter Plot** - Point distribution
11. **Radar Chart** - Multi-axis comparison
12. **Heatmap** - Time-based intensity map

All charts are:
- Fully responsive (mobile, tablet, desktop)
- Interactive with tooltips
- Exportable to image formats
- Themeable (dark/light mode)

---

## Styling & Theming

### SCSS Modules
- Modern `@use` syntax (Sass 1.93)
- CSS Modules for component isolation
- TypeScript declaration files (.d.ts) for all SCSS modules

### Responsive Breakpoints
- **Desktop:** > 1200px
- **Tablet:** 768px - 1200px
- **Mobile:** 480px - 768px
- **Small Mobile:** < 480px

### Theme Customization
Material-UI themes are defined in `theme.tsx`:
- Light theme with blue/green palette
- Dark theme with optimized contrast
- Consistent spacing and typography

---

## Performance Optimizations

1. **Code Splitting:** Vendor chunks separated (React, i18next)
2. **Lazy Loading:** Components loaded on demand
3. **Memoization:** `useMemo` and `useCallback` hooks used strategically
4. **Responsive Images:** Optimized for different screen sizes
5. **Bundle Size:** Chunk size warning limit set to 1000KB

---

## Browser Support

- **Chrome** >= 90
- **Firefox** >= 88
- **Safari** >= 14
- **Edge** >= 90

Modern browsers with ES2020+ support required.

---

## Contributing

### Code Style
- Follow ESLint rules (see `eslint.config.js`)
- Use Prettier for formatting (see `.prettierrc`)
- Write TypeScript with strict mode enabled
- Create tests for new features

### Git Workflow
1. Create a feature branch
2. Write code with tests
3. Run `pnpm lint` and `pnpm test`
4. Submit pull request

### Component Guidelines
- Use functional components with hooks
- Follow Single Responsibility Principle
- Create SCSS modules for styling
- Add TypeScript types for all props
- Write descriptive comments for complex logic

---

## Deployment

### Environment Variables
Set `VITE_API_ENDPOINT` to your production API URL.

### Build Output
The `dist/` folder contains the optimized production build:
- Minified JavaScript bundles
- Optimized CSS
- Static assets
- `index.html` entry point

### Hosting Options
Compatible with:
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **GitHub Pages**
- **Docker** containers

---

## License

This project is private and proprietary.

---

## Architecture Overview

### Design Patterns
- **Container/Presentational** - Smart containers, dumb components
- **Custom Hooks** - Reusable logic (useApi)
- **Context API** - Global state management
- **Composition** - Component composition over inheritance

### State Management
- **Local State:** useState for component-level state
- **Global State:** Context API for shared data (models, predictions)
- **Server State:** Axios for API calls with error handling

### Type Safety
- Full TypeScript coverage
- Strict mode enabled
- API types defined in dedicated files
- SCSS module type declarations

---

## Troubleshooting

### Build Errors
- Ensure TypeScript version is ~5.9.3
- Clear `node_modules` and reinstall: `pnpm install`
- Check for SCSS syntax errors

### API Connection Issues
- Verify `VITE_API_ENDPOINT` in `.env`
- Check backend server is running
- Review CORS configuration on backend

### Test Failures
- Run `pnpm test:run` for fresh test run
- Check MSW handlers in test setup
- Verify test environment configuration

---

## Refactoring History

See `REFACTORING_SUMMARY.md` for detailed information about the recent refactoring that:
- Reduced code by 63% in large components
- Created 9 new sub-components
- Added full mobile responsive design
- Modernized SCSS syntax to `@use`

---

## Contact & Support

For questions, issues, or feature requests, please open an issue in the repository.

---

**Built with React, TypeScript, and passion for clean code**
