import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import DecisionClimax from './components/DecisionClimax.jsx';
import CoreLoop from './components/CoreLoop.jsx';
import AllocLoop from './components/AllocLoop.jsx';
import './styles.css';

// Prototype toggles:
//   ?proto=v2       — the naked capital-allocation loop (current design vision).
//   ?proto=core     — v1: the naked decision loop with hidden-question chapters.
//   ?proto=decision — the full narrative Chapter One slice.
const proto = new URLSearchParams(window.location.search).get('proto');
const Root =
  proto === 'v2' ? AllocLoop :
  proto === 'core' ? CoreLoop :
  proto === 'decision' ? DecisionClimax :
  App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
