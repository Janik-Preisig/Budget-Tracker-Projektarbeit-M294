// src/components/TransactionForm.jsx
import React, { useState } from 'react';

const initialTransaction = {
    description: '',
    amount: 0,
    type: 'Ausgabe', 
    category: '',
    date: new Date().toISOString().split('T')[0]
};

function TransactionForm({ onSubmit }) {
    const [newTransaction, setNewTransaction] = useState(initialTransaction);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setNewTransaction(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newTransaction);
        setNewTransaction(initialTransaction);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <input 
                name="description" 
                value={newTransaction.description} 
                onChange={handleChange} 
                placeholder="Beschreibung" 
                required 
            />
            <input 
                name="amount" 
                type="number" 
                value={newTransaction.amount} 
                onChange={handleChange} 
                placeholder="Betrag" 
                required 
            />
            <select name="type" value={newTransaction.type} onChange={handleChange}>
                <option value="Ausgabe">Ausgabe</option>
                <option value="Einnahme">Einnahme</option>
            </select>
            <input 
                name="category" 
                value={newTransaction.category} 
                onChange={handleChange} 
                placeholder="Kategorie" 
                required 
            />
            <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                Transaktion Speichern
            </button>
        </form>
    );
}

export default TransactionForm;