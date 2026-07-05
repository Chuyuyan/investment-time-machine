import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import DecisionClimax from './components/DecisionClimax.jsx';
import CoreLoop from './components/CoreLoop.jsx';
import './styles.css';

// Prototype toggles:
//   ?proto=decision — the full narrative Chapter One slice.
//   ?proto=core     — the NAKED loop: is the decision game fun with no story?
const proto = new URLSearchParams(window.location.search).get('proto');
const Root = proto === 'core' ? CoreLoop : proto === 'decision' ? DecisionClimax : App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
