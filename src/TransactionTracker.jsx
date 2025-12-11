import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import { fetchTransactions, createTransaction, deleteTransaction } from './api/mongoApi'; 
import './App.css'; // Import des zentralen CSS beibehalten

function TransactionTracker() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // NEUER STATE: Für die Gehalts-Eingabe und den Wert, der hinzugefügt wird
    const [salaryInput, setSalaryInput] = useState(0); 

    // loadData bleibt, um den Initialzustand zu laden und bei Bedarf zu aktualisieren
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

    // NEUE FUNKTION: Fügt das Gehalt als neue Einnahme hinzu
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

        // Ruft die API zum Speichern auf (als Einnahme)
        await handleAdd(salaryTransaction);
        
        // Inputfeld zurücksetzen
        setSalaryInput(0); 
    };

    const totalBalance = transactions.reduce((acc, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : 0;
        return acc + (t.type === 'Einnahme' ? amount : -amount);
    }, 0);
    
    return (
        // *Alte Inline-Styles entfernt und Klassen zugewiesen*
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
                    
                    {/* NEUE GEHALTS-INPUT-STRUKTUR */}
                    <div className="salary-input-group">
                        <input
                            type="number"
                            value={salaryInput}
                            onChange={(e) => setSalaryInput(e.target.value)}
                            placeholder="Gehalt €"
                            min="0.01"
                            step="0.01"
                            className="salary-input" // Neue Klasse
                        />
                        <button 
                            onClick={handleAddSalary}
                            className="salary-button" // Neue Klasse
                        >
                            + Gehalt
                        </button>
                    </div>
                    {/* ENDE NEUE GEHALTS-INPUT-STRUKTUR */}
                </h2>
            </div>
            
            <section className="form-section">
                <h3>Neue Transaktion erfassen</h3>
                <TransactionForm onSubmit={handleAdd} />
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