// src/App.jsx

import React from 'react';
import TransactionTracker from './TransactionTracker';
// WICHTIG: Prüfe den Pfad!
import './App.css'; 

function App() {
    return (
        <div className="App">
            <TransactionTracker />
        </div>
    );
}

export default App;