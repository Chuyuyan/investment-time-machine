import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import DecisionClimax from './components/DecisionClimax.jsx';
import CoreLoop from './components/CoreLoop.jsx';
import AllocLoop from './components/AllocLoop.jsx';
import DeskGame from './components/DeskGame.jsx';
import RunGame from './components/RunGame.jsx';
import InvestGame from './components/InvestGame.jsx';
import PressureGame from './components/PressureGame.jsx';
import './styles.css';

// Prototype toggles:
//   ?proto=pressure — "Rent's Due": investing under economic survival pressure (current).
//   ?proto=research — "The Investigation": research as detective clue-hunting.
//   ?proto=run      — "Investment FTL": portfolio as a Decision Generator.
//   ?proto=game     — the Living Financial Desk MVP.
//   ?proto=v2       — the naked capital-allocation loop.
//   ?proto=core     — v1: the naked decision loop with hidden-question chapters.
//   ?proto=decision — the full narrative Chapter One slice.
const proto = new URLSearchParams(window.location.search).get('proto');
const Root =
  proto === 'pressure' ? PressureGame :
  proto === 'research' ? InvestGame :
  proto === 'run' ? RunGame :
  proto === 'game' ? DeskGame :
  proto === 'v2' ? AllocLoop :
  proto === 'core' ? CoreLoop :
  proto === 'decision' ? DecisionClimax :
  App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
