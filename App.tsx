
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { LessonView } from './pages/LessonView';
import { AIStudio } from './pages/AIStudio';
import { FluencyModule } from './pages/FluencyModule';
import { PlacementTest } from './pages/PlacementTest';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/lesson" element={<LessonView />} />
      <Route path="/studio" element={<AIStudio />} />
      <Route path="/fluency" element={<FluencyModule />} />
      <Route path="/placement" element={<PlacementTest />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
