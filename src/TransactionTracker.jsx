// src/TransactionTracker.jsx (Mit hinzugefügter Kategorie-Verwaltungslogik)

import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager'; // NEU: Import CategoryManager
import { fetchTransactions, createTransaction, deleteTransaction } from './api/mongoApi'; 
import './App.css'; 

const INITIAL_CATEGORIES = [
    'Lebensmittel',
    'Freizeit',
    'Wohnen (Miete/Hypothek)',
    'Gehalt',
    'Sonstiges',
];

function TransactionTracker() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [salaryInput, setSalaryInput] = useState(0); 

    // NEU: Kategorien sind jetzt ein State, um dynamische Verwaltung zu ermöglichen
    const [categories, setCategories] = useState(INITIAL_CATEGORIES); 
    
    // ----------------------------------------------------------------------
    // NEUE KATEGORIE-LOGIK
    // ----------------------------------------------------------------------

    // NEUE FUNKTION: Fügt eine Kategorie hinzu
    const handleAddCategory = (newCategory) => {
        const trimmedCategory = newCategory.trim();
        // Überprüfung auf leere Eingabe und Duplikate
        if (trimmedCategory && !categories.map(c => c.toLowerCase()).includes(trimmedCategory.toLowerCase())) {
            setCategories(prev => [...prev, trimmedCategory]);
        } else if (trimmedCategory) {
            alert(`Die Kategorie "${trimmedCategory}" existiert bereits.`);
        }
    };

    // NEUE FUNKTION: Löscht eine Kategorie
    const handleDeleteCategory = (categoryToDelete) => {
        // Wichtige Prüfung: Ist die Kategorie noch in Transaktionen in Gebrauch?
        const isCategoryUsed = transactions.some(t => t.category === categoryToDelete);

        if (isCategoryUsed) {
            alert(`Die Kategorie "${categoryToDelete}" kann nicht gelöscht werden, da sie noch in Transaktionen verwendet wird.`);
            return;
        }

        if (window.confirm(`Soll die Kategorie "${categoryToDelete}" wirklich gelöscht werden?`)) {
            setCategories(prev => prev.filter(cat => cat !== categoryToDelete));
        }
    };
    
    // ----------------------------------------------------------------------
    // Bestehende Logik (loadData, useEffect, handleAdd, handleDelete, handleAddSalary) bleibt unverändert
    // ----------------------------------------------------------------------
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTransactions();
            setTransactions(data);
        } catch (err) {
            console.error("Fehler beim Laden der Daten:", err);
            setError(err.message || "Daten konnten nicht von der API geladen werden."); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdd = async (transactionData) => {
        setError(null);
        try {
            const newTransactionWithId = await createTransaction(transactionData);
            setTransactions(prev => [...prev, newTransactionWithId]); 
            alert('Transaktion erfolgreich hinzugefügt!');
        } catch (err) {
            console.error("Fehler beim Hinzufügen:", err);
            setError(err.message || "Transaktion konnte nicht gespeichert werden.");
        }
    };

    const handleDelete = async (id) => {
        setError(null);
        if (!window.confirm(`Soll Transaktion ${id.substring(0, 4)}... wirklich gelöscht werden?`)) return;

        try {
            await deleteTransaction(id);
            setTransactions(prev => prev.filter(t => t.id !== id)); 
            alert('Transaktion erfolgreich gelöscht!');
        } catch (err) {
            console.error("Fehler beim Löschen:", err);
            setError(err.message || "Transaktion konnte nicht gelöscht werden.");
        }
    };

    const handleAddSalary = async () => {
        const amount = parseFloat(salaryInput);
        if (isNaN(amount) || amount <= 0) {
            alert("Bitte einen gültigen Betrag eingeben.");
            return;
        }

        const salaryTransaction = {
            description: "Gehaltszahlung (Manuell)",
            amount: amount,
            type: 'Einnahme', 
            category: 'Gehalt',
            date: new Date().toISOString().split('T')[0]
        };

        await handleAdd(salaryTransaction);
        setSalaryInput(0); 
    };

    const totalBalance = transactions.reduce((acc, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : 0;
        return acc + (t.type === 'Einnahme' ? amount : -amount);
    }, 0);
    // ----------------------------------------------------------------------
    
    return (
        <div className="tracker-container">
            
            <header className="tracker-header">
                <h1>💰 Mein Budget Tracker</h1>
                <div className="status-indicator">
                    API-Status: <span className={error ? 'status-error' : 'status-ok'}>
                        {error ? 'FEHLER' : 'Verbunden'}
                    </span>
                </div>
            </header>
            
            <div className="balance-box">
                <h2 className={totalBalance >= 0 ? 'balance-positive' : 'balance-negative'}>
                    <span>Gesamt-Saldo: {loading ? '...' : `${totalBalance.toFixed(2)} €`}</span>
                    
                    {/* Bestehende GEHALTS-INPUT-STRUKTUR */}
                    <div className="salary-input-group">
                        <input
                            type="number"
                            value={salaryInput}
                            onChange={(e) => setSalaryInput(e.target.value)}
                            placeholder="Gehalt €"
                            min="0.01"
                            step="0.01"
                            className="salary-input"
                        />
                        <button 
                            onClick={handleAddSalary}
                            className="salary-button"
                        >
                            + Gehalt
                        </button>
                    </div>
                    {/* ENDE GEHALTS-INPUT-STRUKTUR */}
                </h2>
            </div>
            
            {/* NEUE SEKTION: Kategorien-Verwaltung */}
            <section className="category-management-section">
                <CategoryManager
                    categories={categories} // Übergibt den dynamischen State
                    onAddCategory={handleAddCategory} // Übergibt die Hinzufügen-Funktion
                    onDeleteCategory={handleDeleteCategory} // Übergibt die Lösch-Funktion
                />
            </section>

            <section className="form-section">
                <h3>Neue Transaktion erfassen</h3>
                {/* ANPASSUNG: Übergabe der aktuellen Kategorieliste */}
                <TransactionForm onSubmit={handleAdd} availableCategories={categories} /> 
            </section>

            <section className="list-section">
                <h3>Alle Transaktionen</h3>
                {loading ? <p>Lade Transaktionen...</p> : (
                    <TransactionList 
                        transactions={transactions} 
                        onDelete={handleDelete} 
                    />
                )}
            </section>
            
            {error && <p className="error-message">Fehler: {error}</p>}
        </div>
    );
}

export default TransactionTracker;