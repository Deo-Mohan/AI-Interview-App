import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ModeSelectionPage } from './pages/ModeSelectionPage';
import { ConversationSetupPage } from './pages/ConversationSetupPage';
import { ActiveConversationPage } from './pages/ActiveConversationPage';
import { SessionCompletePage } from './pages/SessionCompletePage';
import { NotesPage } from './pages/NotesPage';
import { VocabularyPage } from './pages/VocabularyPage';
import { VocabularyRevisionPage } from './pages/VocabularyRevisionPage';
import { InterviewSetupPage } from './pages/InterviewSetupPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="modes" element={<ModeSelectionPage />} />
          <Route path="conversation-setup" element={<ConversationSetupPage />} />
          <Route path="conversation" element={<ActiveConversationPage />} />
          <Route path="session-complete" element={<SessionCompletePage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="vocabulary" element={<VocabularyPage />} />
          <Route path="vocabulary-revision" element={<VocabularyRevisionPage />} />
          <Route path="interview-setup" element={<InterviewSetupPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
