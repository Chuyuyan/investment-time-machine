import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import DecisionClimax from './components/DecisionClimax.jsx';
import './styles.css';

// Prototype toggle: /?proto=decision renders the standalone decision-climax
// game-feel prototype; everything else boots the main app untouched.
const proto = new URLSearchParams(window.location.search).get('proto');
const Root = proto === 'decision' ? DecisionClimax : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
