// Language utility functions shared across components
import pythonIcon from '../../assets/python.svg'; 
import javascriptIcon from '../../assets/javascript.svg';
import htmlIcon from '../../assets/html.svg';
import cssIcon from '../../assets/css.svg';
import javaIcon from '../../assets/java.svg';
import csharpIcon from '../../assets/csharp.svg';
import cppIcon from '../../assets/cpp.svg';
import cIcon from '../../assets/c.svg';

/**
 * Maps language names to their corresponding syntax highlighter language identifiers
 * @param {string} language - The language name
 * @returns {string} - The syntax highlighter language identifier
 */
export const getLanguage = (language) => {
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'html': 'markup',
    'css': 'css',
    'java': 'java',
    'c++': 'cpp',
    'c#': 'csharp',
    'c': 'c',
    'cpp': 'cpp'
  };
  return languageMap[language?.toLowerCase()] || 'text';
};

/**
 * Returns the appropriate icon component for a given language
 * @param {string} language - The language name
 * @returns {JSX.Element} - The icon component
 */
export const getLanguageIcon = (language) => {
  const iconMap = {
    "python": <img src={pythonIcon} alt="Python" className="language-icon" />,
    "javascript": <img src={javascriptIcon} alt="JavaScript" className="language-icon" />,
    "html": <img src={htmlIcon} alt="HTML" className="language-icon" />,
    "css": <img src={cssIcon} alt="CSS" className="language-icon" />,
    "java": <img src={javaIcon} alt="Java" className="language-icon" />,
    "c++": <img src={cppIcon} alt="C++" className="language-icon" />,
    "c#": <img src={csharpIcon} alt="C#" className="language-icon" />,
    "c": <img src={cIcon} alt="C" className="language-icon" />,
  };
  return iconMap[language?.toLowerCase()] || <span className="text-icon">TXT</span>;
};

/**
 * Returns the properly formatted display name for a language
 * @param {string} language - The language name
 * @returns {string} - The formatted display name
 */
export const getLanguageDisplayName = (language) => {
  const displayNames = {
    'css': 'CSS',
    'html': 'HTML', 
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'c#': 'C#',
    'c': 'C',
    'cpp': 'C++'
  };
  return displayNames[language?.toLowerCase()] || 
         (language ? language.charAt(0).toUpperCase() + language.slice(1) : '');
};

/**
 * Copies text content to the clipboard
 * @param {string} content - The content to copy
 * @param {function} setAlertMessage - Function to set alert messages
 */
export const copyToClipboard = async (content, setAlertMessage) => {
  try {
    await navigator.clipboard.writeText(content);
    setAlertMessage("Snippet copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    setAlertMessage("Failed to copy to clipboard.");
  }
};

/**
 * Available language options for dropdowns
 */
export const LANGUAGE_OPTIONS = [
  { value: "", label: "Select a language" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "c++", label: "C++" },
  { value: "c#", label: "C#" }
];
