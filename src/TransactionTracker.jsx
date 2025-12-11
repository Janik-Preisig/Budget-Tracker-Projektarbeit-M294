// src/TransactionTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
// Korrekter relativer Pfad
import { fetchTransactions, addTransaction, deleteTransaction } from './api/mongoApi'; 

function TransactionTracker() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTransactions();
            setTransactions(data);
        } catch (err) {
            console.error("Fehler beim Laden der Daten:", err);
            // Nutzt die vom handleResponse geworfene Fehlermeldung
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
            await addTransaction(transactionData);
            alert('Transaktion erfolgreich hinzugefügt!');
            loadData();
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
            alert('Transaktion erfolgreich gelöscht!');
            loadData();
        } catch (err) {
            console.error("Fehler beim Löschen:", err);
            setError(err.message || "Transaktion konnte nicht gelöscht werden.");
        }
    };

    const totalBalance = transactions.reduce((acc, t) => {
        return acc + (t.type === 'Einnahme' ? t.amount : -t.amount);
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
            
        </div>
    );
}

export default TransactionTracker;