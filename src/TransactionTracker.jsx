// src/TransactionTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
// WICHTIG: addTransaction durch createTransaction ersetzen
import { fetchTransactions, createTransaction, deleteTransaction } from './api/mongoApi'; 

function TransactionTracker() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            // **Performance-Verbesserung:** Füge die von der API zurückgegebene Transaktion direkt hinzu
            const newTransactionWithId = await createTransaction(transactionData);
            
            // Lokalen State aktualisieren, anstatt alle Daten neu zu laden
            setTransactions(prev => [...prev, newTransactionWithId]); 
            
            alert('Transaktion erfolgreich hinzugefügt!');
            // loadData(); // NICHT MEHR NÖTIG
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
            
            // **Performance-Verbesserung:** Gelöschte Transaktion lokal filtern
            setTransactions(prev => prev.filter(t => t.id !== id)); 
            
            alert('Transaktion erfolgreich gelöscht!');
            // loadData(); // NICHT MEHR NÖTIG
        } catch (err) {
            console.error("Fehler beim Löschen:", err);
            setError(err.message || "Transaktion konnte nicht gelöscht werden.");
        }
    };

    const totalBalance = transactions.reduce((acc, t) => {
        // Robusterer Umgang mit nicht-numerischen Beträgen, falls die API sie zulässt
        const amount = typeof t.amount === 'number' ? t.amount : 0;
        return acc + (t.type === 'Einnahme' ? amount : -amount);
    }, 0);
    
    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial' }}>
            <h1>💰 Mein Budget Tracker</h1>
            <p>API-Status: {error ? <span style={{ color: 'red' }}>FEHLER</span> : <span style={{ color: 'green' }}>Verbunden</span>}</p>
            
            <h2 style={{ color: totalBalance >= 0 ? 'green' : 'red' }}>
                Gesamt-Saldo: {loading ? '...' : `${totalBalance.toFixed(2)} €`}
            </h2>
            <hr />

            <h3>Neue Transaktion erfassen</h3>
            <TransactionForm onSubmit={handleAdd} />
            <hr />

            <h3>Alle Transaktionen</h3>
            {loading ? <p>Lade Transaktionen...</p> : (
                <TransactionList 
                    transactions={transactions} 
                    onDelete={handleDelete} 
                />
            )}
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Fehler: {error}</p>}
        </div>
    );
}

export default TransactionTracker;