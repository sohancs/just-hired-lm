# 🚀 JustHired.LM

**Real-time Candidate Interview Prep & Resume Analyzer**

A powerful, AI-driven web application that helps job candidates analyze their resumes, compare them with job descriptions, and prepare for interviews with intelligent insights and real-time grounding data.

**App URL** : https://just-hired-lm.vercel.app/

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [API Key Configuration](#api-key-configuration)
- [Key Components](#key-components)
- [Data Storage](#data-storage)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**JustHired.LM** is an intelligent career assistant designed to bridge the gap between your current resume and your target job opportunities. Whether you're preparing for interviews, tailoring your resume, or understanding your skill gaps, this application provides AI-powered analysis and recommendations grounded in real recruitment data.

### Key Highlights:
- 📄 Upload and manage multiple resumes in PDF, DOCX, TXT, MD, or JSON formats
- 💼 Add job descriptions and analyze alignment with your profile
- 🤖 AI-powered gap analysis using Google's Gemini API
- 🌐 Live interview experience data from Glassdoor and Indeed
- 📊 Visual resume parsing with professional layout preview
- ✍️ Generate tailored cover letters and interview prep content
- 🎨 Dark/Light theme support
- 💾 Local browser storage for API keys and preferences

---

## ✨ Features

### 1. **Resume Management**
- Quick file upload for PDF, DOCX, TXT, MD, and JSON documents
- Manual paste option for direct text entry
- Visual resume preview with parsed sections:
  - Executive summary
  - Key competencies
  - Professional milestones
  - Academic foundation
  - Contact information
- Edit mode to refine and update resume content
- Multi-resume support to test different versions

### 2. **Job Description Management**
- Upload job descriptions from company websites
- Manual entry for custom opportunities
- Structured preview with company and role details
- Multiple JD support for comparative analysis

### 3. **AI Match Studio**
- **Grounded Match Score**: Calculate resume-to-JD alignment percentage
- **Aligned Skills Analysis**: Identify matching keywords between resume and job description
- **Missing Skills Identification**: Highlight critical skills you need to emphasize
- **Tailoring Recommendations**: Get 3 actionable steps to improve your application

### 4. **AI-Powered Tools**
- **Gap Analysis**: Deep critique of your resume with optimization suggestions
- **Cover Letter Generator**: AI-written tailored cover letters targeting specific roles
- **Resume Tailor**: Get specific phrases and accomplishments to highlight
- **Mock Interview Prep**: Receive targeted technical and behavioral interview questions
- **Live Interview Experiences**: Search Glassdoor and Indeed for real candidate interview reviews and feedback

### 5. **Interactive Chat Assistant**
- Ask questions about your resume and job descriptions
- Get contextual advice based on your uploaded documents
- Quick-access buttons for common tasks
- Real-time responses powered by Gemini API
- Fallback simulation mode when API key is not configured

### 6. **Document Preview & Editing**
- PDF rendering with canvas-based safe vector display
- Multi-page PDF support with page indicators
- Direct text editing interface
- Real-time state synchronization

### 7. **Theme & Preferences**
- Dark mode (default) and Light mode themes
- Theme preference stored in browser localStorage
- Professional, accessible color schemes

---

## 🛠 Tech Stack

### Frontend Framework
- **React 18.3.1**: Modern UI framework with hooks
- **Vite 5.4.10**: Lightning-fast build tool with HMR (Hot Module Replacement)
- **TypeScript 5.6.2**: Type-safe JavaScript development

### Styling
- **Tailwind CSS 4.3.1**: Utility-first CSS framework
- **@tailwindcss/vite 4.3.1**: Tailwind integration with Vite

### AI & APIs
- **Google Gemini API 2.5 Flash Preview**: AI model for intelligent analysis and content generation
- **pdf.js 2.16.105**: PDF parsing and rendering
- **Mammoth.js 1.6.0**: DOCX file parsing

### Development Tools
- **ESLint 9.13.0**: Code quality and consistency
- **typescript-eslint**: TypeScript-specific linting rules
- **eslint-plugin-react-hooks**: React hooks best practices
- **eslint-plugin-react-refresh**: React Fast Refresh support

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 16+ (LTS recommended)
- **npm** 8+ or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd JustHiredLm
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 4: Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Step 5: Preview Production Build
```bash
npm run preview
```

### Step 6: Code Quality Check
```bash
npm run lint
```

---

## 📖 How to Use

### Quick Start Guide

#### 1. **Add Your Resume**
- Click **⚡ Quick Upload** in the "My Resumes" section
- Select a PDF, DOCX, TXT, MD, or JSON file from your computer
- Or use **+ Paste** to manually enter resume text
- Your resume appears in the sources drawer

#### 2. **Add a Job Description**
- Click **⚡ Quick Upload** in the "Job Descriptions" section
- Upload a JD file or paste text manually
- Enter the target job title and company name
- The JD is now ready for analysis

#### 3. **Check Your Alignment**
- Check the checkbox next to your resume (turn it "Active")
- Check the checkbox next to your JD (turn it "Active")
- Click on the JD in the middle panel
- Navigate to the **AI Match Studio** tab
- View your match score, aligned skills, and missing keywords

#### 4. **Get AI Insights**
- Use the chat panel on the right
- Quick buttons available:
  - 🔍 **Gap Analysis**: Detailed critique and suggestions
  - ✉️ **Tailor Cover Letter**: Generate a custom cover letter
  - ✍️ **Tailor Summary**: Get specific improvements for your summary
  - 🎙️ **Mock Interview**: Prepare for interview questions
  - 🌐 **Past Interview Experiences**: Real candidate feedback from job sites

#### 5. **Edit Documents**
- Click on any resume or JD in the sidebar
- Go to the **Edit Text** tab in the center panel
- Make changes directly (auto-saved to app state)
- Changes reflect immediately in previews

#### 6. **Set Up Gemini API (Optional but Recommended)**
- Click **Set Gemini Key** button in the top-right header
- Paste your Google Gemini API key
- Click **Save Key**
- Now you get real AI-powered responses instead of simulations

---

## 📂 Project Structure

```
JustHiredLm/
├── src/
│   ├── App.jsx                 # Main React component (entire app logic)
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles (Tailwind import)
│   ├── vite-env.d.ts          # Vite type definitions
│   └── assets/                # Static assets folder
├── public/                     # Public static files
├── index.html                 # HTML shell
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TypeScript config
├── tsconfig.node.json         # Node-specific TypeScript config
├── package.json               # Dependencies and scripts
├── eslint.config.js           # ESLint rules
├── dist/                      # Production build output
└── README.md                  # This file
```

---

## 🔧 Key Components

### App.jsx - The Heart of the Application

This is a single-file React component (~2000 lines) containing:

#### **State Hooks** (React State Management)
- `useState`: Manage resumes, JDs, UI state, theme, chat messages
- `useEffect`: Initialize external libraries (pdf.js, mammoth.js)
- `useRef`: Handle file input references and chat scroll
- `useMemo`: Optimize computed values (match score, parsed resume)

#### **Helper Functions**
- `parseMarkdown(text)`: Convert markdown to HTML with Tailwind styling
- `getParsedResumeView(text)`: Extract structured resume data from plain text
- `simulateNotebookResponse(prompt)`: Generate fallback responses without API
- `parsePDFFile(file)`: Convert PDF to text using pdf.js
- `parseDocxFile(file)`: Convert DOCX to text using mammoth.js
- `queryGeminiAPI(prompt, context)`: Call Google Gemini API with retry logic
- `buildContextPrompt()`: Build system prompt with active documents

#### **Event Handlers**
- `handleResumeFileUpload()`: Process uploaded resume files
- `handleJdFileUpload()`: Process uploaded job descriptions
- `handleAddResume()`: Add manually pasted resume
- `handleAddJd()`: Add manually pasted JD
- `handleContentChange()`: Update document content in state
- `handleSendMessage()`: Send chat messages and get responses
- `handleDeleteSource()`: Remove documents from state
- `handleSaveApiKey()`: Store API key in localStorage
- `runPresetTool()`: Execute predefined analysis tools

#### **UI Sections**
1. **Header**: Logo, theme toggle, API key button, activity indicators
2. **Sources Drawer** (Left panel, 3 cols):
   - Resume management with upload/paste
   - Job description management
   - Document list with checkboxes for activation

3. **Document Workspace** (Center panel, 5 cols):
   - Preview tab: Visual resume/JD display
   - Edit Text tab: Direct content editing
   - AI Match Studio tab: Alignment analytics

4. **Chat Panel** (Right panel, 4 cols):
   - Message history
   - Chat input field
   - Quick action buttons
   - Loading states

#### **Modal Dialogs**
- API Key modal: Configure Gemini API
- Resume modal: Upload/paste new resume
- Job Description modal: Upload/paste new JD

#### **Child Components**
- `PDFCanvasRenderer`: Renders PDF pages on canvas elements

---

## 🔐 API Key Configuration

### Why You Need an API Key

By default, the app runs in **Simulation Mode** with pre-written responses. To unlock real AI analysis:

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key (looks like `AIzaSy...`)

2. **Add It to JustHired.LM**
   - Click **Set Gemini Key** in the top-right header
   - Paste your API key
   - Click **Save Key**

3. **How It's Stored**
   - Saved to browser `localStorage` under the key `gemini_api_key`
   - ⚠️ **Warning**: This is not a secure storage method
   - For production, consider moving the key to a backend server with environment variables

### API Model Used
- **Model**: `gemini-2.5-flash-preview-09-2025`
- **Capabilities**:
  - Text analysis and generation
  - Context-aware responses
  - Web search grounding (for live interview experiences)
  - Multi-turn conversations

---

## 💾 Data Storage

### Where Data Is Stored

| Data | Storage Location | Persistence |
|------|-----------------|-------------|
| Resumes | React state (`resumes` array) | Session only |
| Job Descriptions | React state (`jds` array) | Session only |
| Gemini API Key | Browser `localStorage` | Survives page refresh |
| Theme Preference | Browser `localStorage` | Survives page refresh |
| Chat History | React state (`chatMessages`) | Session only |

### Important Notes
- **No Backend Server**: Data is stored only in your browser
- **No Cloud Sync**: Files are not backed up
- **Session-Based**: Closing the browser loses all resumes and JDs
- **Local Only**: Perfect for privacy, but no cross-device sync

### To Persist Data (Future Enhancement)
Consider adding:
- Local file system API (for desktop)
- IndexedDB for larger storage
- Backend database with user authentication
- Cloud sync to Google Drive or similar

---

## 🎨 Styling & Theming

### Color Scheme

#### Dark Mode (Default)
- Background: Deep slate (`#090d16`, `#0a0f1d`)
- Text: Light slate
- Accent: Indigo & Violet
- Hover: Subtle brightness increase

#### Light Mode
- Background: White & light slate
- Text: Dark slate
- Accent: Indigo & Emerald
- Shadows: Soft gray

### Tailwind CSS Integration
- All styling uses Tailwind utility classes
- No separate CSS files (except Tailwind import)
- Responsive design with mobile-first approach
- Custom spacing, shadows, and animations

---

## 🚀 Features Walkthrough

### Resume Upload & Preview
1. Click **⚡ Quick Upload**
2. Select a file (PDF, DOCX, TXT)
3. App parses the file using pdf.js or mammoth.js
4. Parsed resume shows in the sidebar
5. Click to view formatted preview with:
   - Name and contact info
   - Executive summary
   - Skills badges
   - Experience timeline
   - Education cards

### Job Description Matching
1. Add a resume and JD
2. Activate both (check their boxes)
3. Go to **AI Match Studio** tab
4. See:
   - Match percentage score
   - Aligned skills (green badges)
   - Missing skills (red badges)
   - 3 actionable recommendations

### Chat Assistant
1. Activate at least one resume
2. Type a question in the chat input
3. Choose a quick action or ask freely
4. Get AI-powered responses based on your documents
5. View source citations if using web search

### Mock Interview Prep
1. Have active resume and JD
2. Click **🎙️ Mock Interview** button
3. Get 5 targeted interview questions
4. Questions blend JD requirements with your experience
5. Receive ideal answer frameworks

---

## 🛡️ Security Considerations

### Current Implementation
- ⚠️ **Gemini API key stored in localStorage** (not secure for production)
- ✅ PDF rendering uses safe canvas-based approach (no iframe injection)
- ✅ All processing happens client-side (no data sent to unknown servers)
- ✅ Markdown parsing includes XSS protection with dangerouslySetInnerHTML guard

### Production Recommendations
1. Move API key to a backend environment variable
2. Create a backend proxy endpoint for Gemini calls
3. Add user authentication
4. Implement secure session management
5. Use HTTPS only
6. Add rate limiting on API calls

---

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Requires JavaScript enabled and modern ES2020+ support.

---

## 🤝 Contributing

### Development Workflow

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Make Changes** to `src/App.jsx` or supporting files

3. **Hot Reload** - Changes appear instantly in browser

4. **Check Code Quality**
   ```bash
   npm run lint
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

### Code Style
- Uses ESLint with React Hooks plugin
- Follow Tailwind's utility-first approach
- Use React hooks (no class components)
- Keep components functional and pure where possible

### File Upload Formats Supported
- **PDF**: Via pdf.js library
- **DOCX**: Via mammoth.js library
- **TXT, MD, JSON**: Via native FileReader API

---

## 🚧 Future Enhancements

Potential features for future versions:

- [ ] Multi-resume comparative analysis
- [ ] LinkedIn profile import
- [ ] Skill gap visualization charts
- [ ] Interview question database with industry categories
- [ ] Real-time salary benchmarking
- [ ] Cover letter templates library
- [ ] User accounts & cloud sync
- [ ] Batch resume optimization
- [ ] Integration with job boards (LinkedIn, Indeed, Glassdoor)
- [ ] Downloadable tailored resume/cover letter
- [ ] Email integration for job applications
- [ ] Mobile app (React Native)

---

## 📄 License

This project is licensed under the MIT License - feel free to use it for personal or commercial projects.

---

## 🆘 Troubleshooting

### PDF Not Rendering?
- Check that pdf.js CDN is accessible
- Try a different PDF file
- Clear browser cache and refresh

### Gemini API Errors?
- Verify your API key is correct
- Check Google Gemini API quota limits
- Ensure internet connection is active
- Try again after a few seconds (retry logic is built in)

### Files Not Saving?
- Resumes and JDs only persist in the current session
- Use the Edit mode to make changes (auto-saves to state)
- Export/save your documents before closing the browser

### Dark Mode Issues?
- Toggle theme using sun/moon icon in header
- Check browser localStorage is enabled
- Clear cache if theme doesn't persist

---

## 📞 Support

For questions, issues, or suggestions:
1. Check the troubleshooting section above
2. Review the How to Use guide
3. Examine the code comments in `src/App.jsx`
4. Report bugs with detailed steps to reproduce

---

## ✨ Thank You!

Built with ❤️ to help candidates succeed in their job search journey.

**Happy job hunting! 🎯**
