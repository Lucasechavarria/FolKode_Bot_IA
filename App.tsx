
import React from 'react';

import LanguageSelector from './components/LanguageSelector';
import LeadCaptureForm from './components/LeadCaptureForm';
import ChatInterface from './components/ChatInterface';
import AnalyticsPanel from './components/AnalyticsPanel';
import GoodbyeScreen from './components/GoodbyeScreen';
import { useAppLogic } from './hooks/useAppLogic';
import { useChatManager } from './hooks/useChatManager';
import { locales } from './i18n/locales';
import { ContactMethod } from './types';
import AppHeader from './components/AppHeader';

const App: React.FC = () => {
  const {
    language,
    user,
    theme,
    isAdmin,
    analyticsData,
    isAnalyticsPanelOpen,
    isConversationMode,
    handleSelectLanguage,
    handleSetUser,
    handleToggleTheme,
    handleToggleConversationMode,
    setIsAnalyticsPanelOpen,
    updateAnalytics,
    handleRestartSession,
  } = useAppLogic();

  const {
    messages,
    isLoading,
    isSummarizing,
    isChatEnded,
    isListening,
    showGoodbyeScreen,
    handleSendMessage,
    handleEndChat,
    handleFeedback,
    handleMeetingScheduled,
    startListening,
    handleViewConversation,
    restartChat,
  } = useChatManager({
    language,
    user,
    isConversationMode,
    onAnalyticsUpdate: updateAnalytics,
    onSessionRestart: handleRestartSession,
  });

  const handleStartChat = (userDetails: { name: string; contactMethod: ContactMethod; contactInfo: string }) => {
    handleSetUser(userDetails);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    
    updateAnalytics(prev => ({
        ...prev,
        suggestions: {
            ...prev.suggestions,
            [suggestion]: (prev.suggestions[suggestion] || 0) + 1,
        }
    }));
  };
  
  const handleExportChat = () => {
    if (!language || !user) return;
    const header = `Chat Transcript with ${locales.botName[language]}\nUser: ${user.name}\nDate: ${new Date().toLocaleString()}\n\n---\n\n`;
    const transcript = messages.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      let content = msg.text || '';
      if(msg.summaryReport) {
        content = `${locales.chatSummaryTitle[language]}\n${msg.summaryReport.summary}\nTags: ${msg.summaryReport.tags.join(', ')}\nTemperature: ${msg.summaryReport.temperature}`;
      }
      return `[${timestamp}] ${msg.sender === 'bot' ? locales.botName[language] : user.name}:\n${content}\n`;
    }).join('\n');
    
    const blob = new Blob([header + transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_with_${locales.botName[language]}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderAppContent = () => {
    if (!language) {
      return <LanguageSelector onSelectLanguage={handleSelectLanguage} />;
    }
    
    if (!user) {
        const contactPlaceholders = Object.keys(locales)
        .filter(key => key.startsWith('formPlaceholder'))
        .reduce((acc, key) => {
            const method = key.replace('formPlaceholder', '').toLowerCase() as ContactMethod;
            acc[method] = locales[key][language];
            return acc;
        }, {} as { [key in ContactMethod]: string });

      const errorMessages = {
        errorNameMissing: locales.formErrorNameMissing[language],
        errorContactMethodMissing: locales.formErrorContactMethodMissing[language],
        errorContactInfoMissing: locales.formErrorContactInfoMissing[language],
        errorInvalidEmail: locales.formErrorInvalidEmail[language],
      };

      return <LeadCaptureForm 
        onStartChat={handleStartChat} 
        isLoading={isLoading}
        title={locales.formTitle[language]}
        subtitle={locales.formSubtitle[language]}
        namePlaceholder={locales.formNamePlaceholder[language]}
        contactPrompt={locales.formContactPrompt[language]}
        contactPlaceholders={contactPlaceholders}
        buttonText={locales.formButtonText[language]}
        connectingText={locales.formConnectingText[language]}
        changeButtonText={locales.formChangeButtonText[language]}
        errorMessages={errorMessages}
      />
    }
    
    if (showGoodbyeScreen) {
        return (
            <GoodbyeScreen 
                locales={locales} 
                language={language} 
                onBackToConversation={handleViewConversation}
                onRestartChat={restartChat}
            />
        );
    }
    
    return (
      <ChatInterface 
        messages={messages}
        user={user}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
        onMeetingScheduled={handleMeetingScheduled}
        isLoading={isLoading}
        isSummarizing={isSummarizing}
        isChatEnded={isChatEnded}
        onFeedback={handleFeedback}
        onListen={startListening}
        isListening={isListening}
        inputPlaceholder={locales.chatInputPlaceholder[language]}
        summaryGeneratingText={locales.chatSummaryGenerating[language]}
        chatEndedText={locales.chatEndedMessage[language]}
        fileUploadTooltip={locales.fileUploadTooltip[language]}
        locales={locales}
        language={language}
      />
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-[#0B1120] text-gray-800 dark:text-gray-200 font-sans min-h-screen flex flex-col items-center justify-center md:p-4 selection:bg-brand/70 selection:text-white">
      <div className="w-full max-w-2xl h-screen md:h-[95vh] md:max-h-[800px] bg-white dark:bg-[#111827] md:rounded-2xl shadow-2xl flex flex-col border-gray-200 dark:border-gray-700">
        {language && user && !showGoodbyeScreen && (
            <AppHeader
                language={language}
                user={user}
                theme={theme}
                isAdmin={isAdmin}
                isChatEnded={isChatEnded}
                isLoading={isLoading}
                isSummarizing={isSummarizing}
                isConversationMode={isConversationMode}
                locales={locales}
                onToggleTheme={handleToggleTheme}
                onToggleConversationMode={handleToggleConversationMode}
                onExportChat={handleExportChat}
                onEndChat={() => handleEndChat()}
                onOpenAnalytics={() => setIsAnalyticsPanelOpen(true)}
            />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#111827]">
          {renderAppContent()}
        </div>

        {isAdmin && isAnalyticsPanelOpen && (
            <AnalyticsPanel
                data={analyticsData}
                onClose={() => setIsAnalyticsPanelOpen(false)}
                theme={theme}
                locales={locales}
                language={language || 'en'}
            />
        )}
      </div>
    </div>
  );
};

export default App;
