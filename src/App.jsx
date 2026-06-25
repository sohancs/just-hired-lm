import React, { useState, useEffect, useRef, useMemo } from 'react';


// Markdown parser specifically customized for candidate workspace response sheets
const parseMarkdown = (text) => {
  if (!text) return "";
  
  let formatted = text
    .replace(/^### (.*$)/gim, '<h4 class="text-xs font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-4 mb-2">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-2 border-b border-slate-200 dark:border-slate-800/80 pb-1">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="text-base font-black text-slate-900 dark:text-white mt-5 mb-3 border-b border-indigo-100 dark:border-indigo-900/60 pb-2">$1</h2>');

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-600 dark:text-indigo-300 font-bold">$1</strong>');
  formatted = formatted.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 mb-1">$1</li>');
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">$1</code>');
  formatted = formatted.replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: formatted }} className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-1.5" />;
};

// Extracts common parameters from raw text chunks to map out the visual resume timeline cards
const getParsedResumeView = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  let email = "Not found", phone = "Not found", location = "Not found";
  let summary = "";
  const skills = [];
  const experience = [];
  const education = [];

  let currentSection = "";
  let currentExp = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.includes('@') && email === "Not found") {
      const parts = trimmed.split('|');
      email = parts.find(p => p.includes('@'))?.trim() || "";
      phone = parts.find(p => p.includes('+') || /\d{3}-\d{3}/.test(p))?.trim() || "";
      location = parts.find(p => !p.includes('@') && !p.includes('+') && !/\d{3}-\d{3}/.test(p))?.trim() || "";
    }

    if (/summary|profile/i.test(trimmed) && trimmed.length < 25) {
      currentSection = "summary";
      return;
    }
    if (/skills|expertise/i.test(trimmed) && trimmed.length < 25) {
      currentSection = "skills";
      return;
    }
    if (/experience|history|employment/i.test(trimmed) && trimmed.length < 25) {
      currentSection = "experience";
      return;
    }
    if (/education|degree/i.test(trimmed) && trimmed.length < 25) {
      currentSection = "education";
      return;
    }

    if (currentSection === "summary") {
      summary += trimmed + " ";
    } else if (currentSection === "skills") {
      const splitSkills = trimmed.replace(/^-\s*/, '').split(/[,|•]/);
      splitSkills.forEach(s => {
        if (s.trim()) skills.push(s.trim());
      });
    } else if (currentSection === "experience") {
      if (trimmed.includes('|') || (trimmed.includes('-') && (trimmed.includes('20') || trimmed.includes('Present')))) {
        if (currentExp) experience.push(currentExp);
        const parts = trimmed.split('|');
        currentExp = {
          title: parts[0]?.trim() || "Role Title",
          company: parts[1]?.trim() || "Company",
          duration: parts[2]?.trim() || "",
          points: []
        };
      } else if (trimmed.startsWith('-') && currentExp) {
        currentExp.points.push(trimmed.replace(/^-\s*/, ''));
      }
    } else if (currentSection === "education") {
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|');
        education.push({
          degree: parts[0]?.trim(),
          school: parts[1]?.trim(),
          year: parts[2]?.trim()
        });
      } else {
        education.push({ degree: trimmed, school: "", year: "" });
      }
    }
  });

  if (currentExp) experience.push(currentExp);

  return {
    name: lines[0] || "Resume Document",
    email, phone, location,
    summary: summary.trim(),
    skills, experience, education
  };
};


// Simulates real career advisory pipelines locally if a developer has not set up a custom Gemini key
const simulateNotebookResponse = (prompt, activeRes, activeJob, enableSearch = false) => {
  const promptL = prompt.toLowerCase();
  const hasResume = activeRes.length > 0;
  const hasJd = activeJob.length > 0;
  
  let resumeName = hasResume ? activeRes[0].name : "your resume";
  let jdName = hasJd ? activeJob[0].title : "the target role";
  let companyName = hasJd ? activeJob[0].company : "the target company";

  if (enableSearch || promptL.includes('glassdoor') || promptL.includes('indeed') || promptL.includes('experiences')) {
    return {
      text: `### 🏢 Past Interview Experiences & Candidate Journeys (Simulation Mode)

I conducted a targeted real-time search simulation indexing candidate files, recruitment logs, and historical past interview logs for **${companyName}** for the role of **${jdName}**.

#### 1. Past Candidate Experience Overview
* **Overall Interview Rating**: 3.9 / 5 (Positive)
* **Interview Difficulty**: 3.7 / 5 (Moderate to Hard)
* **Pipeline Duration**: 3 - 4 weeks
* **Sourcing Method**: 45% Online Application, 30% LinkedIn/Indeed Recruiter Outreach, 25% Employee Referrals

#### 2. General Interview Flow Pattern
1. **Initial Screen**: 30-minute HR call assessing behavioral alignment, basic background, and salary expectations.
2. **Technical Screen (HackerRank / Interactive Live Code)**: Dynamic assessments focusing on arrays, structures, CSS layouts, or React hooks optimization.
3. **Virtual Onsite Loop (3-4 rounds)**:
   * **Deep-Dive Engineering**: Heavy assessment of components architecture, state management, and async operations.
   * **System Design & Performance**: Building highly concurrent dashboard layouts, caching, and minimizing re-renders.
   * **Culture & Leadership**: Behavioral questions aligning to ownership and user focus.

#### 3. Actual Sample Questions Filed by Candidates
* *"Create a custom debounce wrapper using React Hooks without third-party frameworks."*
* *"What strategies would you suggest to measure and optimize Cumulative Layout Shift (CLS) on high-frequency dashboards?"*
* *"Tell me about a time you had to challenge a technical standard because of constraint limits."*

*To run actual live queries leveraging live Google Web Grounding, plug in your Gemini API key in the upper right header configuration.*`,
      attributions: [
        { uri: 'https://www.glassdoor.com/Reviews/index.htm', title: 'Glassdoor - Reviews & Salaries' },
        { uri: 'https://www.indeed.com/companies', title: 'Indeed - Company Interview Reviews' },
        { uri: 'https://www.linkedin.com/feed/', title: 'LinkedIn - Company Interview Reviews' }
      ]
    };
  }

  if (promptL.includes('gap') || promptL.includes('analyze')) {
    return {
      text: `### 📊 AI Source-Grounded Gap Analysis (Simulation Mode)

I have simulated a deep assessment based on:
- **Resume Source**: ${resumeName}
- **Job Description Source**: ${jdName}

Here are the key matching insights:

#### 1. Keyword Alignment Map
- **Strong Match Keywords**: React, Node.js, Frontend, TypeScript
- **Missing / Underrated Keywords**: Cloud Scaling architectures, GraphQL query optimizations, Unit testing with Jest.

#### 2. Structural Grade: B+
- **Strength**: Highly technical, measurable accomplishments.
- **Weakness**: Summary section is slightly too generic. Tailor it to explicitly mention automation and system scale.

#### 3. Actionable Recommendations
- **Add Cloud-centric phrasing** in your top summary.
- **Update at least 2 job accomplishments** in your latest role to explicitly claim metric-focused system gains.

*To activate actual state-of-the-art AI analysis, provide a Gemini API Key in the top right window panel.*`
    };
  }

  if (promptL.includes('cover') || promptL.includes('letter')) {
    return {
      text: `### ✉️ Tailored Cover Letter (Simulation Mode)

Dear Hiring Team,

I am writing to express my strong interest in the **${jdName}** position. With a robust engineering background highlighting key wins in front-end system modularity, clean web applications, and collaborative design implementation, my skills map directly to the targets outlined in your role description.

In my previous capacity, I engineered responsive, secure digital experiences while leading collaborative engineering tasks. Some of my signature accomplishments include:
- Designing scalable design architectures that slashed handoff cycles by 30%.
- Refactoring critical component workflows, resulting in a 35% performance upgrade.
- Unifying cross-functional parameters to launch product releases 10 days ahead of schedule.

I am eager to translate this hands-on engineering capability to streamline visual integrity and platform excellence. Thank you for your time and consideration.

Sincerely,
[Your Name]`
    };
  }

  if (promptL.includes('interview') || promptL.includes('mock')) {
    return {
      text: `### 🎙️ Mock Interview Preparation Pack (Simulation Mode)

Based on the active job requirements for **${jdName}** and experiences in **${resumeName}**, here are targeted interview questions:

#### Q1: "Your resume mentions improving dashboard load times by 35%. Can you explain the exact performance metrics and technical strategies you used to achieve this?"
- **Hiring Manager Intent**: Verify technical depth and ensure metrics are not fabricated.
- **Ideal Response Formula**: Mention bundle splitting, lazy loading, API parallelization, and profiling with Chrome DevTools or Lighthouse.

#### Q2: "How do you handle disagreements between design systems standards and practical engineering deadlines?"
- **Hiring Manager Intent**: Assess collaborative style and soft skills.
- **Ideal Response Formula**: Highlight compromise, modular component creation, and the importance of standard-based UX design patterns.

#### Q3: "Explain how you structure global state management in highly concurrent interactive web platforms."
- **Hiring Manager Intent**: Test architectural competence.
- **Ideal Response Formula**: Walk through context optimization, state managers (Redux/Zustand), and memoization patterns to avoid redundant rendering.`
    };
  }

  return {
    text: `### 🧠 JustHired.LM Assistant (Offline Mode)

I am analyzing your active sources. I received your request: "${prompt}"

To assist you fully, I have processed the selected documents:
- **Resume Context**: ${hasResume ? `${activeRes.length} selected (${activeRes[0].name})` : "None"}
- **Job Description Context**: ${hasJd ? `${activeJob.length} selected (${activeJob[0].title})` : "None"}

**Key Highlight:** To unlock real-time intelligence tailored precisely to these documents, configure a **Gemini API Key** in the header. Alternatively, choose from the quick prompts listed below!`
  };
};


// Pure Javascript PDF-to-Canvas vector rendering component. Chrome sandbox-safe!
function PDFCanvasRenderer({ fileUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    const renderPDF = async () => {
      try {
        if (!window.pdfjsLib) {
          throw new Error("PDF.js library is still initializing. Please wait a brief moment.");
        }
        
        const pdf = await window.pdfjsLib.getDocument(fileUrl).promise;
        if (!isMounted) return;
        
        setNumPages(pdf.numPages);
        setLoading(false);

        // Allow UI queue to cycle before capturing DOM elements
        setTimeout(async () => {
          for (let i = 1; i <= pdf.numPages; i++) {
            if (!isMounted) break;
            try {
              const page = await pdf.getPage(i);
              const canvas = document.getElementById(`pdf-page-canvas-${i}`);
              if (!canvas) continue;
              
              const context = canvas.getContext('2d');
              const containerWidth = containerRef.current?.clientWidth || 550;
              
              const unscaledViewport = page.getViewport({ scale: 1.0 });
              const scale = (containerWidth - 32) / unscaledViewport.width;
              const viewport = page.getViewport({ scale: Math.min(scale, 1.4) });

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              const renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              await page.render(renderContext).promise;
            } catch (renderErr) {
              console.error("Failed rendering page element", i, renderErr);
            }
          }
        }, 120);

      } catch (err) {
        console.error("PDF.js parsing exception:", err);
        if (isMounted) {
          setError(err.message || "Failed to parse/load local PDF file.");
          setLoading(false);
        }
      }
    };

    renderPDF();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-semibold animate-pulse">Rendering native PDF layouts safely onto HTML5 Canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
        <p className="text-xs font-bold">Local PDF Sandbox Intercepted</p>
        <p className="text-[11px] mt-1 text-slate-400">{error}</p>
        <p className="text-[10px] mt-2 text-indigo-400 italic">Try clicking "Edit Text" to view raw content directly.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-210px)] p-2 w-full items-center">
      {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
        <div key={pageNum} className="bg-white p-2 shadow-xl border border-slate-200 dark:border-slate-800 rounded-lg max-w-full">
          <canvas 
            id={`pdf-page-canvas-${pageNum}`} 
            className="max-w-full h-auto block bg-white rounded shadow-inner"
          />
          <div className="text-center text-[10px] text-slate-500 py-1.5 border-t border-slate-100 bg-slate-50 font-bold rounded-b">
            Page {pageNum} of {numPages}
          </div>
        </div>
      ))}
    </div>
  );
}


export default function App() {
  // Start with clean, pristine, empty states instead of mock preloads
  const [resumes, setResumes] = useState([]);
  const [jds, setJds] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [activeTab, setActiveTab] = useState('interactive'); // 'interactive' (Preview) | 'edit' | 'match'
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyStatus, setKeyStatus] = useState('idle');
  
  // Custom Toast notification widget state
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 4500);
  };
  
  // Theme state: dark mode defaults true, stored locally
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const localTheme = localStorage.getItem('justhired_theme');
    return localTheme ? localTheme === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('justhired_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // 1. Load PDF.js Display Core
    const pdfScript = document.createElement('script');
    pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    pdfScript.async = true;
    document.head.appendChild(pdfScript);

    pdfScript.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      }
    };

    // 2. Load Word parsing (Mammoth.js)
    const mammothScript = document.createElement('script');
    mammothScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
    mammothScript.async = true;
    document.head.appendChild(mammothScript);

    return () => {
      document.head.removeChild(pdfScript);
      document.head.removeChild(mammothScript);
    };
  }, []);
  
  // Modal toggle values
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showJdModal, setShowJdModal] = useState(false);
  const [newResumeText, setNewResumeText] = useState('');
  const [newResumeName, setNewResumeName] = useState('');
  const [newJdText, setNewJdText] = useState('');
  const [newJdTitle, setNewJdTitle] = useState('');
  const [newJdCompany, setNewJdCompany] = useState('');
  
  // Store uploaded blob metadata temporarily for custom rendering
  const [modalFileUrl, setModalFileUrl] = useState(null);
  const [modalFileType, setModalFileType] = useState('txt');

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null); // Reference for Quick JD Upload

  // AI Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome to **JustHired.LM**! 👋\n\nI am your grounded recruitment consultant. I analyze your checked resumes and job descriptions to answer technical queries, run gap analysis, or draft custom covers.\n\n✨ **New Feature**: Click **Past Interview Experiences** below to fetch real candidate interview journeys, specific interview questions, and pipeline feedback using live search grounding!",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const currentSelectedSource = useMemo(() => {
    if (!selectedSourceId) return null;
    const isResume = selectedSourceId.startsWith('res-');
    if (isResume) {
      return resumes.find(r => r.id === selectedSourceId);
    } else {
      return jds.find(j => j.id === selectedSourceId);
    }
  }, [selectedSourceId, resumes, jds]);

  const activeResumes = useMemo(() => resumes.filter(r => r.isActive), [resumes]);
  const activeJds = useMemo(() => jds.filter(j => j.isActive), [jds]);

  const parsedResume = useMemo(() => {
    if (selectedSourceId && selectedSourceId.startsWith('res-')) {
      return getParsedResumeView(currentSelectedSource?.content || "");
    }
    return null;
  }, [currentSelectedSource, selectedSourceId]);

  const localMatchAnalytics = useMemo(() => {
    if (activeResumes.length === 0 || activeJds.length === 0) return null;
    
    const resumeText = activeResumes[0].content.toLowerCase();
    const jdText = activeJds[0].content.toLowerCase();

    const skillList = [
      'react', 'next.js', 'typescript', 'javascript', 'python', 'aws', 'docker', 'tailwind', 
      'figma', 'sketch', 'research', 'analytics', 'database', 'node.js', 'postgresql', 'mongodb'
    ];

    const presentInResume = skillList.filter(skill => resumeText.includes(skill));
    const presentInJd = skillList.filter(skill => jdText.includes(skill));
    
    const matching = presentInJd.filter(skill => presentInResume.includes(skill));
    const missing = presentInJd.filter(skill => !presentInResume.includes(skill));

    let baseScore = 50;
    if (presentInJd.length > 0) {
      baseScore += Math.round((matching.length / presentInJd.length) * 45);
    }
    if (resumeText.length > 1000) baseScore += 5;

    const finalScore = Math.min(baseScore, 98);

    return {
      score: finalScore,
      matching,
      missing,
      recommendedActions: [
        `Incorporate "${missing[0] || 'Target Keywords'}" directly into your executive summary or skills shelf.`,
        "Quantify your bullet points: Replace passive tasks with metric-driven accomplishments.",
        "Add a Dedicated Projects section to demonstrate technical experience with missing components."
      ]
    };
  }, [activeResumes, activeJds]);


  const parsePDFFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!window.pdfjsLib) {
        reject(new Error("The PDF processing subsystem is loading. Please try again in a few seconds."));
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await window.pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(" ");
            text += pageText + "\n";
          }
          resolve(text);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const parseDocxFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!window.mammoth) {
        reject(new Error("The DOCX document subsystem is loading. Please try again in a few seconds."));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        window.mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then((result) => {
            resolve(result.value);
          })
          .catch((err) => reject(err));
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');

    showToast(`Parsing and loading: "${file.name}"...`, "info");

    try {
      let textContent = "";
      let fileUrl = null;

      if (extension === 'pdf') {
        textContent = await parsePDFFile(file);
        fileUrl = URL.createObjectURL(file); 
      } else if (extension === 'docx') {
        textContent = await parseDocxFile(file);
      } else if (extension === 'txt' || extension === 'md' || extension === 'json') {
        textContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
      } else {
        setNewResumeName(baseName);
        setShowResumeModal(true);
        showToast(`Extension .${extension} is parsed best via manual copy-paste!`, "info");
        if (e.target) e.target.value = '';
        return;
      }

      if (!textContent || !textContent.trim()) {
        throw new Error("No readable text could be extracted from this document.");
      }

      const newId = `res-${Date.now()}`;
      const newRes = {
        id: newId,
        name: baseName,
        isActive: true,
        content: textContent,
        fileType: extension,
        fileUrl: fileUrl 
      };
      setResumes(prev => [...prev, newRes]);
      setSelectedSourceId(newId);
      showToast(`Parsed & displayed "${baseName}" successfully!`, "success");
    } catch (err) {
      console.error(err);
      showToast(`Parse failed: ${err.message || err}. Try copying your text manually.`, "error");
    }

    if (e.target) e.target.value = '';
  };

  const handleJdFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');

    showToast(`Parsing and loading JD: "${file.name}"...`, "info");

    try {
      let textContent = "";
      let fileUrl = null;

      if (extension === 'pdf') {
        textContent = await parsePDFFile(file);
        fileUrl = URL.createObjectURL(file);
      } else if (extension === 'docx') {
        textContent = await parseDocxFile(file);
      } else if (extension === 'txt' || extension === 'md' || extension === 'json') {
        textContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
      } else {
        setNewJdTitle(baseName);
        setShowJdModal(true);
        showToast(`Extension .${extension} is parsed best via manual copy-paste!`, "info");
        if (e.target) e.target.value = '';
        return;
      }

      if (!textContent || !textContent.trim()) {
        throw new Error("No readable text could be extracted from this document.");
      }

      const newId = `jd-${Date.now()}`;
      const newJd = {
        id: newId,
        title: baseName,
        company: 'Uploaded Organization',
        isActive: true,
        content: textContent,
        fileType: extension,
        fileUrl: fileUrl
      };
      setJds(prev => [...prev, newJd]);
      setSelectedSourceId(newId);
      showToast(`Parsed & displayed JD "${baseName}" successfully!`, "success");
    } catch (err) {
      console.error(err);
      showToast(`Parse failed: ${err.message || err}. Try copying your text manually.`, "error");
    }

    if (e.target) e.target.value = '';
  };

  const toggleResumeActive = (id) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const toggleJdActive = (id) => {
    setJds(prev => prev.map(j => j.id === id ? { ...j, isActive: !j.isActive } : j));
  };

  const handleAddResume = (e) => {
    e.preventDefault();
    if (!newResumeName || !newResumeText) {
      showToast("Please ensure both file title and body text are populated.", "error");
      return;
    }
    const newId = `res-${Date.now()}`;
    const newRes = {
      id: newId,
      name: newResumeName,
      isActive: true,
      content: newResumeText,
      fileType: modalFileType || 'txt',
      fileUrl: modalFileUrl || null
    };
    setResumes(prev => [...prev, newRes]);
    setSelectedSourceId(newId);
    setNewResumeName('');
    setNewResumeText('');
    setModalFileUrl(null);
    setModalFileType('txt');
    setShowResumeModal(false);
    showToast(`Added source: ${newResumeName}`, "success");
  };

  const handleAddJd = (e) => {
    e.preventDefault();
    if (!newJdTitle || !newJdText) {
      showToast("Please ensure job title and description body are populated.", "error");
      return;
    }
    const newId = `jd-${Date.now()}`;
    const newJd = {
      id: newId,
      title: newJdTitle,
      company: newJdCompany || 'Unknown Company',
      isActive: true,
      content: newJdText
    };
    setJds(prev => [...prev, newJd]);
    setSelectedSourceId(newId);
    setNewJdTitle('');
    setNewJdCompany('');
    setNewJdText('');
    setShowJdModal(false);
    showToast(`Added JD context: ${newJdTitle}`, "success");
  };

  const handleDeleteSource = (id, e) => {
    e.stopPropagation();
    const isResume = id.startsWith('res-');
    if (isResume) {
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedSourceId === id) {
        const remaining = resumes.filter(r => r.id !== id);
        setSelectedSourceId(remaining.length > 0 ? remaining[0].id : '');
      }
      showToast("Resume removed from source bank.", "info");
    } else {
      setJds(prev => prev.filter(j => j.id !== id));
      if (selectedSourceId === id) {
        const remaining = jds.filter(j => j.id !== id);
        setSelectedSourceId(remaining.length > 0 ? remaining[0].id : '');
      }
      showToast("Job Description removed from source bank.", "info");
    }
  };

  const handleSaveApiKey = (key) => {
    localStorage.setItem('gemini_api_key', key);
    setUserApiKey(key);
    setKeyStatus('success');
    setTimeout(() => {
      setShowKeyModal(false);
      setKeyStatus('idle');
    }, 1000);
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setUserApiKey('');
    setKeyStatus('idle');
    showToast("Gemini API key cleared.", "info");
  };

  const handleContentChange = (newText) => {
    if (selectedSourceId.startsWith('res-')) {
      setResumes(prev => prev.map(r => r.id === selectedSourceId ? { ...r, content: newText } : r));
    } else {
      setJds(prev => prev.map(j => j.id === selectedSourceId ? { ...j, content: newText } : j));
    }
  };


  const queryGeminiAPI = async (userPrompt, systemInstruction, enableSearch = false) => {
    const apiKey = userApiKey || ""; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    if (enableSearch) {
      payload.tools = [{ "google_search": {} }];
    }

    let delay = 1000;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Immediately throw client-side errors (Invalid Key, Billing, Blocked Project) without triggering redundant retry loops!
        if (response.status >= 400 && response.status < 500) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `API Client Error ${response.status}`;
          throw new Error(errMsg);
        }

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to extract response content.";
          
          const metadata = data.candidates?.[0]?.groundingMetadata;
          let attributions = [];

          // Parse both standard Developer API (groundingChunks) and Enterprise (groundingAttributions) schemas safely
          if (metadata?.groundingChunks) {
            attributions = metadata.groundingChunks.map(chunk => ({
              uri: chunk.web?.uri,
              title: chunk.web?.title || chunk.web?.uri
            })).filter(a => a.uri);
          } else if (metadata?.groundingAttributions) {
            attributions = metadata.groundingAttributions.map(a => ({
              uri: a.web?.uri,
              title: a.web?.title || a.web?.uri
            })).filter(a => a.uri);
          }

          return { text: responseText, attributions };
        }

        // Retry only on server fatigue (5xx) or Rate limits (429)
        if (response.status === 429 || response.status >= 500) {
          if (attempt === 4) {
            throw new Error(`Server returned status ${response.status}. Please try again later.`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        throw new Error(`Unexpected Response Status ${response.status}`);
      } catch (err) {
        // If it's a client error (e.g. invalid key or permission issue), bubble it up immediately
        if (err.message && (err.message.includes("API Client Error") || err.message.includes("key") || err.message.includes("permission") || err.message.includes("not found"))) {
          throw err;
        }
        if (attempt === 4) throw err;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("API could not be reached after multiple retries.");
  };

  const handleSendMessage = async (customPrompt = '', enableSearch = false) => {
    const promptToSend = customPrompt || chatInput;
    if (!promptToSend.trim()) return;

    const newUserMsg = { sender: 'user', text: promptToSend, timestamp: new Date() };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const systemContext = buildContextPrompt();
      
      let aiResponseText = "";
      let aiSources = [];

      if (!userApiKey) {
        const simulated = simulateNotebookResponse(promptToSend, activeResumes, activeJds, enableSearch);
        aiResponseText = simulated.text;
        aiSources = simulated.attributions || [];
      } else {
        const apiResponse = await queryGeminiAPI(promptToSend, systemContext, enableSearch);
        aiResponseText = apiResponse.text;
        aiSources = apiResponse.attributions || [];
      }

      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: aiResponseText,
        sources: aiSources,
        timestamp: new Date()
      }]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: `⚠️ **API Error:** ${error.message}\n\nPlease verify your API key in the top right corner. You can still use the fully interactive playground without a key, which will simulate realistic resume analytics locally!`,
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleLiveInterviewSearch = () => {
    if (activeJds.length === 0) {
      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: "⚠️ **No active Job Description checked!** To perform a live lookup, please check a job description on the left panel so we can target a real company & position.",
        timestamp: new Date()
      }]);
      return;
    }

    const targetCompany = activeJds[0].company;
    const targetTitle = activeJds[0].title;
    
    const livePrompt = `Look up candidate interview reviews, ratings, stages, and specific interview questions on Glassdoor or Indeed or LinkedIn or official company sites for the position of "${targetTitle}" at company "${targetCompany}". Summarize standard hiring timelines, technical coding assessments or design rounds, typical question difficulty, and direct advice given by candidates who went through this cycle recently. Also provide source links from which this information was gathered. If no recent reviews are found, provide general advice for preparing for interviews at this company and role.`;
    
    handleSendMessage(livePrompt, true);
  };

  const runPresetTool = (toolName) => {
    if (activeResumes.length === 0) {
      setChatMessages(prev => [...prev, {
        sender: 'assistant',
        text: "⚠️ **No active resumes detected!** Please check the checkbox next to at least one resume on the left panel so I have background knowledge to assist you.",
        timestamp: new Date()
      }]);
      return;
    }

    let prompt = "";
    switch (toolName) {
      case 'gap':
        if (activeJds.length === 0) {
          prompt = "Perform a holistic critique on my selected resume, highlighting areas of professional growth, vocabulary optimization, and general formatting advice.";
        } else {
          prompt = `Analyze the gaps between my active resume (${activeResumes[0].name}) and the checked Job Description (${activeJds[0].title} at ${activeJds[0].company}). Outline clear mismatch metrics and identify skills I should add to my profile.`;
        }
        break;
      case 'cover':
        if (activeJds.length === 0) {
          prompt = "Draft a professional, compelling, and adaptable cover letter template focusing on my core expertise and achievements found in my resume.";
        } else {
          prompt = `Write a high-converting, tailored cover letter aligning the achievements in my resume (${activeResumes[0].name}) to the role of ${activeJds[0].title} at ${activeJds[0].company}. Focus heavily on target impact metrics!`;
        }
        break;
      case 'tailor':
        if (activeJds.length === 0) {
          prompt = "Revamp my professional summary to make it highly authoritative, concise, and focused on leading-edge achievements.";
        } else {
          prompt = `Provide a completely tailored summary and a list of optimized key achievements for my resume to perfectly target the ${activeJds[0].title} role. Tell me exactly what phrases to switch.`;
        }
        break;
      case 'interview':
        if (activeJds.length === 0) {
          prompt = "Act as an technical hiring manager. Based on my resume, list 5 difficult behavior/technical questions I should prepare for, and describe what the ideal candidate answers should highlight.";
        } else {
          prompt = `Act as the hiring manager for ${activeJds[0].company} interviewing for the ${activeJds[0].title} position. Provide 5 targeted, highly challenging interview questions combining requirements from the JD and experience points from my resume. Provide suggested bullet points for ideal responses.`;
        }
        break;
      default:
        return;
    }
    handleSendMessage(prompt);
  };


  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500/30 ${
      isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* TOAST SYSTEM POPUP */}
      {toast.visible && (
        <div className="fixed bottom-6 left-6 z-50 animate-bounce max-w-sm">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center space-x-3 text-xs font-semibold ${
            toast.type === 'error' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
            toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
            'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
          }`}>
            <span>⚡ {toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className={`h-16 border-b px-6 flex items-center justify-between sticky top-0 z-40 shadow-md transition-colors ${
        isDarkMode ? 'border-slate-800/80 bg-[#0c1222]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className={`font-bold text-base leading-none tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              JustHired<span className="text-indigo-500 font-black">.LM</span>
            </h1>
            <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time Candidate Interview Prep & Resume Analyzer
            </p>
          </div>
        </div>

        <div className={`hidden md:flex items-center space-x-4 text-xs px-4 py-2 rounded-full border transition-colors ${
          isDarkMode ? 'text-slate-400 bg-slate-900/40 border-slate-800/60' : 'text-slate-600 bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <span>{activeResumes.length} Active Resumes</span>
          </div>
          <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>|</span>
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>{activeJds.length} Active JDs</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800/60 border-slate-700 text-amber-400 hover:bg-slate-700/80' 
                : 'bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707M17.657 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button 
            onClick={() => setShowKeyModal(true)}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              userApiKey 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 hover:bg-indigo-500/20'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>{userApiKey ? 'Gemini Key Active' : 'Set Gemini Key'}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 grid grid-cols-12 h-[calc(100vh-64px)] overflow-hidden">
        
        {/* PANEL 1: SOURCES SIDEBAR (3 Columns) */}
        <section className={`col-span-3 border-r flex flex-col h-full select-none transition-colors ${
          isDarkMode ? 'border-slate-800/80 bg-[#0a0f1d]' : 'border-slate-200 bg-slate-50'
        }`}>
          
          <div className={`p-4 border-b flex items-center justify-between transition-colors ${
            isDarkMode ? 'border-slate-800 bg-[#0a0f1d]' : 'border-slate-200 bg-slate-50'
          }`}>
            <h2 className={`font-bold text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sources Drawer</h2>
            <span className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Grounding Context</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* RESUME FILES CONTAINER */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Resumes</span>
                </h3>
                
                <div className="flex items-center space-x-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleResumeFileUpload} 
                    accept=".pdf,.docx,.txt,.md,.json" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    title="Quickly parse and load PDF, DOCX, TXT or MD files"
                    className={`text-[10px] font-bold flex items-center space-x-1 cursor-pointer px-2 py-1 rounded transition-colors ${
                      isDarkMode ? 'text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                    }`}
                  >
                    <span>⚡ Quick Upload</span>
                  </button>
                  <button 
                    onClick={() => setShowResumeModal(true)}
                    className={`text-[10px] font-bold flex items-center space-x-1 cursor-pointer px-1.5 py-1 rounded transition-colors ${
                      isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>+ Paste</span>
                  </button>
                </div>
              </div>

              {resumes.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-slate-400 text-xs">
                  No Resumes added. Use ⚡ Quick Upload above!
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.map(res => (
                    <div 
                      key={res.id}
                      onClick={() => setSelectedSourceId(res.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start space-x-3 group ${
                        selectedSourceId === res.id 
                          ? (isDarkMode ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-indigo-50 border-indigo-200 shadow-sm') 
                          : (isDarkMode ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80' : 'bg-white border-slate-200 hover:bg-slate-50')
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={res.isActive}
                        onChange={() => toggleResumeActive(res.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500/30 bg-slate-950 border-slate-700 h-4 w-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{res.name}</p>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {res.fileType ? res.fileType.toUpperCase() : 'TXT'} • {res.content.split(/\s+/).filter(Boolean).length} words
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSource(res.id, e)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete document"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* JOB DESCRIPTION CONTAINER */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5 ${
                  isDarkMode ? 'text-emerald-300' : 'text-emerald-600'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Job Descriptions</span>
                </h3>
                
                <div className="flex items-center space-x-1">
                  <input 
                    type="file" 
                    ref={jdFileInputRef} 
                    onChange={handleJdFileUpload} 
                    accept=".pdf,.docx,.txt,.md,.json" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => jdFileInputRef.current.click()}
                    title="Quickly parse and load Job Description files"
                    className={`text-[10px] font-bold flex items-center space-x-1 cursor-pointer px-2 py-1 rounded transition-colors ${
                      isDarkMode ? 'text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <span>⚡ Quick Upload</span>
                  </button>
                  <button 
                    onClick={() => setShowJdModal(true)}
                    className={`text-[10px] font-bold flex items-center space-x-1 cursor-pointer px-1.5 py-1 rounded transition-colors ${
                      isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>+ Paste</span>
                  </button>
                </div>
              </div>

              {jds.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg text-slate-400 text-xs">
                  No JDs added. Use ⚡ Quick Upload above!
                </div>
              ) : (
                <div className="space-y-2">
                  {jds.map(jd => (
                    <div 
                      key={jd.id}
                      onClick={() => setSelectedSourceId(jd.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start space-x-3 group ${
                        selectedSourceId === jd.id 
                          ? (isDarkMode ? 'bg-emerald-600/10 border-emerald-500/40' : 'bg-emerald-50/80 border-emerald-200 shadow-sm') 
                          : (isDarkMode ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80' : 'bg-white border-slate-200 hover:bg-slate-50')
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={jd.isActive}
                        onChange={() => toggleJdActive(jd.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500/30 bg-slate-950 border-slate-700 h-4 w-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{jd.title}</p>
                        <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {jd.fileType ? jd.fileType.toUpperCase() : 'TXT'} • {jd.company} • {jd.content.split(/\s+/).filter(Boolean).length} words
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSource(jd.id, e)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete document"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* <div className={`p-4 border-t transition-colors ${
            isDarkMode ? 'border-slate-800 bg-[#080d19]' : 'border-slate-200 bg-slate-100/70'
          }`}>
            <p className={`text-[10px] leading-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
              👉 <strong>Tip:</strong> Dragging files onto sidebar parses headers dynamically and formats your contextual databases immediately.
            </p>
          </div> */}
        </section>

        {/* PANEL 2: MIDDLE DOCUMENT WORKSPACE (5 Columns) */}
        <section className={`col-span-5 flex flex-col h-full border-r transition-colors ${
          isDarkMode ? 'bg-[#0e1424] border-slate-800/80' : 'bg-slate-100/50 border-slate-200/80'
        }`}>
          
          {currentSelectedSource ? (
            <>
              <div className={`p-4 border-b flex items-center justify-between shrink-0 transition-colors ${
                isDarkMode ? 'border-slate-800 bg-[#0a0f1d]' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                    selectedSourceId.startsWith('res-') 
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' 
                      : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {selectedSourceId.startsWith('res-') ? 'Resume' : 'Job Description'}
                  </span>
                  <h2 className={`font-bold text-sm truncate max-w-[200px] ${isDarkMode ? 'text-white' : 'text-slate-800'}`} title={currentSelectedSource?.name || currentSelectedSource?.title}>
                    {selectedSourceId.startsWith('res-') ? currentSelectedSource?.name : currentSelectedSource?.title}
                  </h2>
                </div>
                
                {/* WORKSPACE NAVIGATION TABS */}
                <div className={`flex p-1 rounded-lg border transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/60 border-slate-300/40'
                }`}>
                  <button 
                    onClick={() => setActiveTab('interactive')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === 'interactive' 
                        ? (isDarkMode ? 'bg-[#0e1424] text-white shadow' : 'bg-white text-indigo-600 shadow-sm') 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => setActiveTab('edit')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === 'edit' 
                        ? (isDarkMode ? 'bg-[#0e1424] text-white shadow' : 'bg-white text-indigo-600 shadow-sm') 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Edit Text
                  </button>
                  <button 
                    onClick={() => setActiveTab('match')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === 'match' 
                        ? (isDarkMode ? 'bg-[#0e1424] text-white shadow' : 'bg-white text-indigo-600 shadow-sm') 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    AI Match Studio
                  </button>
                </div>
              </div>

              {/* ACTIVE WORKSPACE CONTENTS */}
              <div className={`flex-1 overflow-y-auto p-6 transition-colors ${
                isDarkMode ? 'bg-[#0c1120]' : 'bg-slate-50/50'
              }`}>
                
                {/* TAB 1: PREVIEW */}
                {activeTab === 'interactive' && (
                  <div className="space-y-4 h-full flex flex-col animate-fade-in">
                    
                    {/* Visual Canvas Rendering for PDF layout - Safe vector renderer */}
                    {currentSelectedSource?.fileType === 'pdf' && currentSelectedSource?.fileUrl ? (
                      <div className="w-full h-full flex-1 min-h-[550px] relative border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-950 flex flex-col p-2">
                        <PDFCanvasRenderer fileUrl={currentSelectedSource.fileUrl} />
                      </div>
                    ) : (
                      /* FALLBACK: Render visual template layouts for parsed data */
                      selectedSourceId.startsWith('res-') && parsedResume ? (
                        <div className={`rounded-xl p-6 border shadow-xl space-y-6 transition-all ${
                          isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-slate-100'
                        }`}>
                          <div className={`border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{parsedResume.name}</h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                              {parsedResume.email && parsedResume.email !== "Not found" && <span className="flex items-center">✉️ {parsedResume.email}</span>}
                              {parsedResume.phone && parsedResume.phone !== "Not found" && <span className="flex items-center">📞 {parsedResume.phone}</span>}
                              {parsedResume.location && parsedResume.location !== "Not found" && <span className="flex items-center">📍 {parsedResume.location}</span>}
                            </div>
                          </div>

                          {parsedResume.summary && (
                            <div>
                              <h4 className="text-xs font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Executive Summary</h4>
                              <p className="text-sm leading-relaxed">{parsedResume.summary}</p>
                            </div>
                          )}

                          {parsedResume.skills.length > 0 && (
                            <div>
                              <h4 className="text-xs font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2.5">Key Competencies</h4>
                              <div className="flex flex-wrap gap-2">
                                {parsedResume.skills.map((skill, index) => (
                                  <span key={index} className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedResume.experience.length > 0 && (
                            <div>
                              <h4 className="text-xs font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-4">Professional Milestones</h4>
                              <div className="space-y-5 relative pl-4 border-l-2 border-indigo-500/20">
                                {parsedResume.experience.map((exp, index) => (
                                  <div key={index} className="relative group">
                                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 border border-slate-50 dark:border-[#0c1120] ring-4 ring-indigo-500/15" />
                                    <div className="flex items-start justify-between">
                                      <h5 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{exp.title}</h5>
                                      <span className={`text-xs px-2 py-0.5 rounded border ${isDarkMode ? 'text-slate-500 bg-slate-950 border-slate-800' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>{exp.duration}</span>
                                    </div>
                                    <p className="text-xs text-indigo-500 dark:text-indigo-300 font-semibold mt-0.5">{exp.company}</p>
                                    {exp.points.length > 0 && (
                                      <ul className="list-disc pl-4 mt-2 space-y-1">
                                        {exp.points.map((pt, pIdx) => (
                                          <li key={pIdx} className="text-xs leading-relaxed">{pt}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {parsedResume.education.length > 0 && (
                            <div>
                              <h4 className="text-xs font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-3">Academic Foundation</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {parsedResume.education.map((edu, index) => (
                                  <div key={index} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                                    <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{edu.degree}</p>
                                    <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                                      <span>{edu.school}</span>
                                      <span>{edu.year}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Render formatted Job Details Preview */
                        currentSelectedSource && (
                          <div className={`rounded-xl p-6 border shadow-xl space-y-5 transition-all ${
                            isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-slate-100'
                          }`}>
                            <div className={`border-b pb-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                              <span className="text-xs text-emerald-500 font-bold tracking-widest uppercase">{currentSelectedSource.company}</span>
                              <h1 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentSelectedSource.title}</h1>
                            </div>
                            
                            <div className="space-y-4 text-sm leading-relaxed">
                              {currentSelectedSource.content.split('\n').map((para, i) => {
                                const trimmed = para.trim();
                                if (!trimmed) return null;
                                
                                if (trimmed.startsWith('-')) {
                                  return (
                                    <div key={i} className="flex items-start space-x-2 pl-2">
                                      <span className="text-emerald-400 mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-emerald-500" />
                                      <span className="text-xs">{trimmed.replace(/^-\s*/, '')}</span>
                                    </div>
                                  );
                                }
                                
                                if (trimmed.toUpperCase() === trimmed && trimmed.length < 50) {
                                  return <h4 key={i} className="text-xs font-extrabold text-emerald-500 uppercase tracking-widest pt-3">{trimmed}</h4>;
                                }

                                return <p key={i} className="text-xs leading-relaxed">{trimmed}</p>;
                              })}
                            </div>
                          </div>
                        )
                      )
                    )}

                  </div>
                )}

                {/* TAB 2: EDIT TEXT VIEW */}
                {activeTab === 'edit' && currentSelectedSource && (
                  <div className="h-full flex flex-col space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Directly edit this document below. State will automatically synchronize.</span>
                      <span>{currentSelectedSource.content.length} characters</span>
                    </div>
                    <textarea
                      value={currentSelectedSource.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className={`flex-1 w-full min-h-[350px] p-4 rounded-xl border font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 resize-none shadow-inner transition-colors ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                      placeholder="Paste raw text here..."
                    />
                  </div>
                )}

                {/* TAB 3: AI MATCH STUDIO */}
                {activeTab === 'match' && (
                  <div className="space-y-5">
                    
                    {/* Check alignment dependencies */}
                    {(activeResumes.length === 0 || activeJds.length === 0) ? (
                      <div className={`text-center py-10 rounded-xl border border-dashed p-6 flex flex-col items-center transition-colors ${
                        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-300'
                      }`}>
                        <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-sm">Context Setup Needed</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                          To utilize AI Match Studio, check at least **one Resume** and **one Job Description** on the left panel.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        
                        {/* Compliance Score Ribbon */}
                        <div className={`rounded-xl border p-5 shadow-lg flex items-center justify-between transition-colors bg-gradient-to-r ${
                          isDarkMode 
                            ? 'from-indigo-900/40 to-slate-900 border-indigo-500/20' 
                            : 'from-indigo-50 to-white border-indigo-200 shadow-indigo-100'
                        }`}>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Grounded Match Score</h4>
                            <p className="text-[10px] text-slate-500 mt-1">Based on text overlap and skills heuristics</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="relative flex items-center justify-center">
                              <svg className="w-16 h-16 transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="4" fill="transparent" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-emerald-500 transition-all" strokeWidth="4" fill="transparent" 
                                  strokeDasharray={2 * Math.PI * 28} 
                                  strokeDashoffset={2 * Math.PI * 28 * (1 - (localMatchAnalytics?.score || 0) / 100)} 
                                />
                              </svg>
                              <span className="absolute text-sm font-black">{localMatchAnalytics?.score}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Skill Analysis Grids */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-lg border transition-colors ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Aligned Skillsets</span>
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {localMatchAnalytics?.matching.length === 0 ? (
                                <span className="text-xs text-slate-500 italic">No clear common tech overlaps found</span>
                              ) : (
                                localMatchAnalytics?.matching.map((skill, index) => (
                                  <span key={index} className="px-2 py-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                    {skill}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          <div className={`p-4 rounded-lg border transition-colors ${
                            isDarkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>Missing Focus Skills</span>
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {localMatchAnalytics?.missing.length === 0 ? (
                                <span className="text-xs text-emerald-500 italic font-semibold">Perfect alignment of checked keywords!</span>
                              ) : (
                                localMatchAnalytics?.missing.map((skill, index) => (
                                  <span key={index} className="px-2 py-0.5 text-[11px] font-semibold text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded">
                                    {skill}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Alignment Action Checklist */}
                        <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
                          isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm shadow-slate-100'
                        }`}>
                          <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">Urgent Tailoring Recommendations</h5>
                          <div className="space-y-2">
                            {localMatchAnalytics?.recommendedActions.map((action, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-xs">
                                <span className="h-4 w-4 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] border border-indigo-500/20 mt-0.5">{idx + 1}</span>
                                <span className="leading-normal">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Trigger analysis chat */}
                        <button 
                          onClick={() => runPresetTool('gap')}
                          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs rounded-lg shadow-lg hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Draft Deep Alignment Report in Chat</span>
                        </button>

                      </div>
                    )}

                  </div>
                )}

              </div>
            </>
          ) : (
            /* PLACEHOLDER / GRACEFUL EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
              <div className="h-16 w-16 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/20">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Workspace is Empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                Start by uploading your **resumes** and **job descriptions** in the sidebar drawer on the left. Once loaded, click on them to preview, edit, or check alignment metrics!
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  ⚡ Upload Resume File
                </button>
                <button 
                  onClick={() => jdFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  ⚡ Upload JD File
                </button>
              </div>
            </div>
          )}

        </section>

        {/* PANEL 3: CONVERSATIONAL CHAT (4 Columns) */}
        <section className={`col-span-4 flex flex-col h-full relative transition-colors ${
          isDarkMode ? 'bg-[#0a0f1d]' : 'bg-slate-50'
        }`}>
          
          {/* SOURCING SHELF / ACTIVE BARS */}
          <div className={`p-3 border-b flex items-center justify-between shrink-0 transition-colors ${
            isDarkMode ? 'bg-slate-950 border-slate-800/60' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase shrink-0">Context Stack:</span>
              <div className="flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap py-1">
                {activeResumes.map(r => (
                  <span key={r.id} className="inline-flex items-center bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full">
                    📄 {r.name.split('-')[0].trim()}
                  </span>
                ))}
                {activeJds.map(j => (
                  <span key={j.id} className="inline-flex items-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full">
                    💼 {j.title.split('(')[0].trim()}
                  </span>
                ))}
                {activeResumes.length === 0 && activeJds.length === 0 && (
                  <span className="text-[10px] text-rose-500 italic">No contexts active!</span>
                )}
              </div>
            </div>
          </div>

          {/* CHAT CHRONICLES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border transition-colors ${
                  msg.sender === 'user'
                    ? (isDarkMode ? 'bg-indigo-600/20 border-indigo-500/30 text-slate-100 rounded-br-none' : 'bg-indigo-50/80 border-indigo-200 text-slate-800 rounded-br-none')
                    : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 rounded-bl-none' : 'bg-white border-slate-200 text-slate-700 rounded-bl-none')
                }`}>
                  <div className="flex items-center space-x-2 mb-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    <span>{msg.sender === 'user' ? 'You' : 'JustHired Agent'}</span>
                    <span>•</span>
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  {parseMarkdown(msg.text)}

                  {/* Render Search Attribution Grounding Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={`mt-3 pt-2.5 border-t text-[11px] space-y-1 ${isDarkMode ? 'border-slate-800/80 text-slate-500' : 'border-slate-100 text-slate-600'}`}>
                      <p className="font-extrabold uppercase tracking-widest text-[9px] text-indigo-500 dark:text-indigo-400">Live Grounding Sources (Indeed/Glassdoor data):</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.sources.map((src, sIdx) => (
                          <a 
                            key={sIdx} 
                            href={src.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all font-medium"
                          >
                            <span>🌐</span>
                            <span className="truncate max-w-[140px]">{src.title || src.uri}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className={`max-w-[85%] rounded-2xl p-4 border rounded-bl-none space-y-2 transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold">
                    <span className="animate-pulse">Analyzing search sources & docs...</span>
                  </div>
                  <div className="flex space-x-1.5 items-center py-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUICK PROMPT SHELF */}
          <div className={`px-4 py-2 border-t flex flex-wrap gap-2 shrink-0 transition-colors ${
            isDarkMode ? 'border-slate-800 bg-[#0a0f1d]' : 'border-slate-200 bg-slate-100/60'
          }`}>
            <button 
              onClick={handleLiveInterviewSearch}
              className="px-2.5 py-1 text-xs rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 cursor-pointer transition-colors font-bold flex items-center space-x-1"
            >
              <span>🌐 Past Interview Experiences</span>
            </button>
            <button 
              onClick={() => runPresetTool('gap')}
              className={`px-2.5 py-1 text-xs rounded border cursor-pointer transition-colors ${
                isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-300' : 'bg-white text-slate-600 hover:border-indigo-500 border-slate-200'
              }`}
            >
              🔍 Gap Analysis
            </button>
            <button 
              onClick={() => runPresetTool('cover')}
              className={`px-2.5 py-1 text-xs rounded border cursor-pointer transition-colors ${
                isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-300' : 'bg-white text-slate-600 hover:border-indigo-500 border-slate-200'
              }`}
            >
              ✉️ Tailor Cover Letter
            </button>
            <button 
              onClick={() => runPresetTool('tailor')}
              className={`px-2.5 py-1 text-xs rounded border cursor-pointer transition-colors ${
                isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-300' : 'bg-white text-slate-600 hover:border-indigo-500 border-slate-200'
              }`}
            >
              ✍️ Tailor Summary
            </button>
            <button 
              onClick={() => runPresetTool('interview')}
              className={`px-2.5 py-1 text-xs rounded border cursor-pointer transition-colors ${
                isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-300' : 'bg-white text-slate-600 hover:border-indigo-500 border-slate-200'
              }`}
            >
              🎙️ Mock Interview
            </button>
          </div>

          {/* CHAT INPUT AREA */}
          <div className={`p-4 border-t shrink-0 transition-colors ${
            isDarkMode ? 'border-slate-800 bg-[#070b14]' : 'border-slate-200 bg-slate-100/50'
          }`}>
            <div className="relative">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about resumes, JDs, or query interview benchmarks..."
                className={`w-full text-xs rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 shadow-inner transition-colors ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow shadow-indigo-500/20"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* ==========================================
          MODALS & FLOATING WIDGETS
         ========================================== */}
      
      {/* 1. API KEY FLOATING DROPDOWN MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`border rounded-xl max-w-md w-full p-6 shadow-2xl relative transition-all ${
            isDarkMode ? 'bg-[#0e1424] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button 
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="font-bold text-base flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Gemini API Integration</span>
            </h3>
            
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We leverage Google's stable **gemini-2.5-flash** model for context-grounded analysis and custom web searches. Save your key to locally persist session authentication.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Your Gemini API Key</label>
                <input 
                  type="password"
                  defaultValue={userApiKey}
                  id="apiKeyInput"
                  placeholder="AIzaSy..."
                  className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {keyStatus === 'success' && (
                <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Key successfully saved to localStorage!</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    const val = document.getElementById('apiKeyInput').value;
                    handleSaveApiKey(val);
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Save Key
                </button>
                {userApiKey && (
                  <button 
                    onClick={handleRemoveApiKey}
                    className="px-3 py-2 border border-slate-200 hover:border-red-500 text-slate-500 hover:text-red-500 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPLOAD/PASTE RESUME MODAL */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`border rounded-xl max-w-xl w-full p-6 shadow-2xl relative transition-all ${
            isDarkMode ? 'bg-[#0e1424] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setShowResumeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="font-bold text-base flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Custom Resume Document</span>
            </h3>
            
            <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col items-center justify-center text-center space-y-2 relative">
              <svg className="w-8 h-8 text-indigo-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-xs">
                <span className="font-bold text-indigo-500">Choose a file</span> or drag it here
              </div>
              <p className="text-[10px] text-slate-400">Supports PDF, DOCX, TXT, MD</p>
              <input 
                type="file" 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const extension = file.name.split('.').pop().toLowerCase();
                  const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
                  setNewResumeName(baseName);
                  
                  showToast(`Reading and parsing "${file.name}"...`, "info");
                  
                  try {
                    let text = "";
                    let fileUrl = null;
                    if (extension === 'pdf') {
                      text = await parsePDFFile(file);
                      fileUrl = URL.createObjectURL(file);
                    } else if (extension === 'docx') {
                      text = await parseDocxFile(file);
                    } else {
                      text = await new Promise((res, rej) => {
                        const r = new FileReader();
                        r.onload = (evt) => res(evt.target.result);
                        r.onerror = (err) => rej(err);
                        r.readAsText(file);
                      });
                    }
                    setNewResumeText(text);
                    setModalFileUrl(fileUrl);
                    setModalFileType(extension);
                    showToast(`Text parsed from: ${file.name}`, "success");
                  } catch (err) {
                    showToast(`Failed to parse: ${err.message}`, "error");
                  }
                }}
                accept=".pdf,.docx,.txt,.md,.json" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <form onSubmit={handleAddResume} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Resume Identifier Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Maria Sanchez - Full Stack Dev"
                  value={newResumeName}
                  onChange={(e) => setNewResumeName(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Resume Body Text (Auto-filled from Upload)</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Extracted file text will appear here. You can also paste manually."
                  value={newResumeText}
                  onChange={(e) => setNewResumeText(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg"
                >
                  Create Document
                </button>
                <button 
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-500 font-semibold text-xs rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. UPLOAD/PASTE JOB DESCRIPTION MODAL */}
      {showJdModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`border rounded-xl max-w-xl w-full p-6 shadow-2xl relative transition-all ${
            isDarkMode ? 'bg-[#0e1424] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button 
              onClick={() => setShowJdModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="font-bold text-base flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Custom Job Description</span>
            </h3>
            
            <form onSubmit={handleAddJd} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Target Job Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Lead React Developer"
                    value={newJdTitle}
                    onChange={(e) => setNewJdTitle(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500/50 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Company Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Apple Inc."
                    value={newJdCompany}
                    onChange={(e) => setNewJdCompany(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500/50 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Paste Job Description Text</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Paste details of requirements, expectations, tech stacks, and credentials from the job posting."
                  value={newJdText}
                  onChange={(e) => setNewJdText(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Add Job Description
                </button>
                <button 
                  type="button"
                  onClick={() => setShowJdModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-500 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  function buildContextPrompt() {
    let contextStr = "You are JustHired.LM, an expert career strategist and professional matchmaker. You have access to the following user-selected files:\n\n";
    
    if (activeResumes.length > 0) {
      contextStr += "=== ACTIVE RESUMES ===\n";
      activeResumes.forEach((res, idx) => {
        contextStr += `[RESUME #${idx+1}]: ${res.name}\n---CONTENT START---\n${res.content}\n---CONTENT END---\n\n`;
      });
    } else {
      contextStr += "[No active resumes are currently checked or provided.]\n\n";
    }

    if (activeJds.length > 0) {
      contextStr += "=== ACTIVE JOB DESCRIPTIONS ===\n";
      activeJds.forEach((jd, idx) => {
        contextStr += `[JOB DESCRIPTION #${idx+1}]: ${jd.title} at ${jd.company}\n---CONTENT START---\n${jd.content}\n---CONTENT END---\n\n`;
      });
    } else {
      contextStr += "[No active job descriptions are currently checked or provided.]\n\n";
    }

    contextStr += `\nINSTRUCTIONS: Answer the user's questions utilizing ONLY the documents listed above. Base your insights, tips, critiques, or interview guides on the factual contents of these specific resumes and job descriptions. Keep recommendations hyper-targeted, action-oriented, and structured with clean markdown format. Do not invent details not present in the files unless explaining that you are drafting illustrative samples based on their profile.`;

    return contextStr;
  }
}