// src/components/TransactionForm.jsx (BEARBEITET)

import React, { useState, useEffect } from 'react';

// initialTransaction wird nun in der Komponente gesetzt, 
// da es den ersten Wert der Categories benötigt
const initialTransactionTemplate = {
    description: '',
    amount: 0,
    type: 'Ausgabe', 
    date: new Date().toISOString().split('T')[0]
};

// NEU: availableCategories als Prop hinzufügen
function TransactionForm({ onSubmit, availableCategories }) { 
    
    // 1. NEUER STATE-INITIALISIERUNG: Wir setzen die Kategorie auf den ersten Wert, 
    //    sobald die Kategorien geladen sind (useEffect).
    const [newTransaction, setNewTransaction] = useState({
        ...initialTransactionTemplate,
        // Setze die Kategorie auf den ersten verfügbaren Wert ODER leer, falls Liste leer
        category: availableCategories && availableCategories.length > 0 ? availableCategories[0] : ''
    });

    // 2. Stelle sicher, dass der initialTransaction-State die erste Kategorie setzt, 
    //    wenn die Komponente neu geladen wird oder die Kategorien sich ändern (optional, zur Sicherheit)
    useEffect(() => {
        if (newTransaction.category === '' && availableCategories && availableCategories.length > 0) {
            setNewTransaction(prev => ({
                ...prev,
                category: availableCategories[0]
            }));
        }
    }, [availableCategories, newTransaction.category]);


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setNewTransaction(prev => ({
            ...prev,
            // Prüfe beim Betrag auf gültige Zahl, sonst ist der Wert der String
            [name]: name === 'amount' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Füge hier eine grundlegende Validierung ein
        if (!newTransaction.category || !newTransaction.description || newTransaction.amount <= 0) {
             alert('Bitte alle Felder korrekt ausfüllen (Beschreibung, Betrag > 0, Kategorie).');
             return;
        }

        onSubmit(newTransaction);
        
        // Formular zurücksetzen: Setze Kategorie wieder auf den ersten Wert der Liste
        setNewTransaction({
            ...initialTransactionTemplate,
            category: availableCategories && availableCategories.length > 0 ? availableCategories[0] : ''
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
            
            {/* Beschreibung */}
            <input 
                name="description" 
                value={newTransaction.description} 
                onChange={handleChange} 
                placeholder="Beschreibung" 
                required 
            />
            
            {/* Betrag */}
            <input 
                name="amount" 
                type="number" 
                value={newTransaction.amount} 
                onChange={handleChange} 
                placeholder="Betrag" 
                required 
                min="0.01" // Mindestwert hinzufügen
                step="0.01"
            />
            
            {/* Typ (Ausgabe/Einnahme) */}
            <select name="type" value={newTransaction.type} onChange={handleChange}>
                <option value="Ausgabe">Ausgabe</option>
                <option value="Einnahme">Einnahme</option>
            </select>
            
            {/* 3. WICHTIG: Ersetzt das Text-Input-Feld für Kategorie durch ein Select-Feld */}
            <select 
                name="category" 
                value={newTransaction.category} 
                onChange={handleChange} 
                required 
            >
                {/* 4. Mapping über die übergebenen Kategorien */}
                {availableCategories && availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            {/* Speichern Button */}
            <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                Transaktion Speichern
            </button>
        </form>
    );
}

export default TransactionForm;