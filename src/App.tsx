import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import MessengerPage from './pages/MessengerPage';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const { state } = useApp();

  if (!state.currentUser) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <MessengerPage />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
