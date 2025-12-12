// src/components/TransactionList.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionList from './TransactionList';
import '@testing-library/jest-dom';

// Mock-Daten
const mockTransactions = [
    { id: 't1', description: 'Miete', amount: 850.50, type: 'Ausgabe', category: 'Wohnen' },
    { id: 't2', description: 'Gehalt', amount: 2500.00, type: 'Einnahme', category: 'Einkommen' },
    { id: 't3', description: 'Kaffee', amount: 4.99, type: 'Ausgabe', category: 'Essen' },
];

const mockOnDelete = jest.fn();

describe('TransactionList', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Überprüfung des leeren Zustands
    test('zeigt eine Meldung an, wenn keine Transaktionen vorhanden sind', () => {
        render(<TransactionList transactions={[]} onDelete={mockOnDelete} />);
        
        // Sucht nach dem Text, der im leeren Zustand angezeigt wird
        expect(screen.getByText('Noch keine Transaktionen vorhanden.')).toBeInTheDocument();
        
        // Stellt sicher, dass die Tabellenkopfzeilen trotzdem gerendert werden
        expect(screen.getByRole('columnheader', { name: 'Beschreibung' })).toBeInTheDocument();
    });

    // Test 2: Überprüfung des Renderings mit Daten
    test('rendert alle Transaktionen korrekt', () => {
        render(<TransactionList transactions={mockTransactions} onDelete={mockOnDelete} />);

        // Überprüft, ob alle Beschreibungen gerendert werden
        expect(screen.getByText('Miete')).toBeInTheDocument();
        expect(screen.getByText('Gehalt')).toBeInTheDocument();
        expect(screen.getByText('Kaffee')).toBeInTheDocument();
        
        // Überprüft, ob alle Kategorien gerendert werden
        expect(screen.getByText('Wohnen')).toBeInTheDocument();
        expect(screen.getByText('Einkommen')).toBeInTheDocument();
        
        // Überprüft, ob die richtige Anzahl an Lösch-Buttons gerendert wird
        const deleteButtons = screen.getAllByRole('button', { name: 'Löschen' });
        expect(deleteButtons).toHaveLength(mockTransactions.length);
    });

    // Test 3: Überprüfung der Formatierung von Beträgen (Farbe und Vorzeichen)
    test('zeigt Ausgaben mit rotem Vorzeichen und Einnahmen mit grünem Vorzeichen an', () => {
        render(<TransactionList transactions={mockTransactions} onDelete={mockOnDelete} />);
        
        // Findet den Betrag für die Ausgabe 'Miete' (-850.50)
        const expenseAmount = screen.getByText('-850.50');
        expect(expenseAmount).toBeInTheDocument();
        expect(expenseAmount).toHaveStyle('color: red');
        
        // Findet den Betrag für die Einnahme 'Gehalt' (2500.00)
        const incomeAmount = screen.getByText('2500.00'); // Kein Vorzeichen, da 'Einnahme'
        expect(incomeAmount).toBeInTheDocument();
        expect(incomeAmount).toHaveStyle('color: green');
    });

    // Test 4: Funktionalität des Lösch-Buttons
    test('ruft onDelete mit der korrekten ID auf, wenn der Lösch-Button geklickt wird', () => {
        render(<TransactionList transactions={mockTransactions} onDelete={mockOnDelete} />);

        // Wir finden den Lösch-Button, der zur Transaktion 'Kaffee' gehört
        // Am einfachsten über die Zelle, die den Text 'Kaffee' enthält
        const coffeeRow = screen.getByText('Kaffee').closest('tr');
        const deleteButton = coffeeRow.querySelector('button');

        // Klicken auf den Lösch-Button
        fireEvent.click(deleteButton);

        // Überprüfen, ob mockOnDelete mit der ID von 'Kaffee' aufgerufen wurde
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith('t3');
    });
});