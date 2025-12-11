// src/components/TransactionList.jsx
import React from 'react';

function TransactionList({ transactions, onDelete }) {
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th>Beschreibung</th>
                    <th>Betrag</th>
                    <th>Typ</th>
                    <th>Kategorie</th>
                    <th>Aktionen</th>
                </tr>
            </thead>
            <tbody>
                {transactions.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>Noch keine Transaktionen vorhanden.</td></tr>
                ) : (
                    transactions.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td>{t.description}</td>
                            <td style={{ color: t.type === 'Einnahme' ? 'green' : 'red', fontWeight: 'bold' }}>
                                {t.type === 'Ausgabe' && '-'}{t.amount.toFixed(2)}
                            </td>
                            <td>{t.type}</td>
                            <td>{t.category}</td>
                            <td>
                                <button 
                                    onClick={() => onDelete(t.id)} 
                                    style={{ color: 'white', backgroundColor: 'red', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                >
                                    Löschen
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}

export default TransactionList;