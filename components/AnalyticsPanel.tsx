
import React from 'react';
import { AnalyticsData, Theme, Language } from '../types';

interface AnalyticsPanelProps {
  data: AnalyticsData;
  onClose: () => void;
  theme: Theme;
  locales: any;
  language: Language;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data, onClose, theme, locales, language }) => {
  const topSuggestions = Object.entries(data.suggestions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-6 animate-slide-up ${theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{locales.analyticsPanelTitle[language]}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label={locales.analyticsClose[language]}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{locales.analyticsTotalChats[language]}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.totalChats}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{locales.analyticsFeedbackScore[language]}</p>
            <div className="flex justify-center items-center gap-4 mt-2">
              <span className="text-2xl font-bold text-green-500 flex items-center gap-2">
                <i className="bi bi-hand-thumbs-up-fill"></i> {data.feedback.likes}
              </span>
              <span className="text-2xl font-bold text-red-500 flex items-center gap-2">
                <i className="bi bi-hand-thumbs-down-fill"></i> {data.feedback.dislikes}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{locales.analyticsTopSuggestions[language]}</h3>
          {topSuggestions.length > 0 ? (
            <ul className="space-y-2">
              {topSuggestions.map(([suggestion, count]) => (
                <li key={suggestion} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate pr-4" title={suggestion}>{suggestion}</span>
                  <span className="font-bold text-brand-dark dark:text-brand bg-brand/20 dark:bg-brand/30 px-2 py-0.5 rounded-full text-sm">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-gray-500 dark:text-gray-400 italic">No suggestion data yet.</p>
          )}
        </div>
      </div>
       <style>{`
        .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slide-up {
            animation: slideUp 0.4s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `}</style>
    </div>
  );
};

export default AnalyticsPanel;