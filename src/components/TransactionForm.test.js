// src/components/TransactionForm.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionForm from './TransactionForm';
import '@testing-library/jest-dom';

// Mock-Daten
const mockAvailableCategories = ['Essen', 'Miete', 'Gehalt'];
const mockOnSubmit = jest.fn();

// Mock-Funktion für window.alert, um sie im Test zu unterdrücken/überwachen
const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

describe('TransactionForm', () => {

    // Setzt die Mocks vor jedem Test zurück
    beforeEach(() => {
        jest.clearAllMocks();
        // Setze das Datum für konsistente Tests
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-12-12'));
    });

    // Stellt die echten Timer nach den Tests wieder her
    afterAll(() => {
        jest.useRealTimers();
        mockAlert.mockRestore(); // Stelle den echten Alert wieder her
    });


    // Test 1: Überprüfung des korrekten Renderings und Initialzustands
    test('rendert alle Formular-Elemente und setzt den Initialzustand korrekt', () => {
        render(
            <TransactionForm 
                onSubmit={mockOnSubmit} 
                availableCategories={mockAvailableCategories} 
            />
        );

        // Überprüfe Input-Felder
        expect(screen.getByPlaceholderText('Beschreibung')).toHaveValue('');
        expect(screen.getByPlaceholderText('Betrag')).toHaveValue(0.00); // Input type="number" gibt 0 als leeren Wert
        
        // Überprüfe Select-Felder
        expect(screen.getByRole('option', { name: 'Ausgabe' }).selected).toBe(true);
        expect(screen.getByRole('option', { name: 'Einnahme' }).selected).toBe(false);
        
        // Überprüfe die Kategorie (muss der erste Wert sein)
        const categorySelect = screen.getByRole('combobox', { name: /category/i });
        expect(categorySelect).toHaveValue(mockAvailableCategories[0]); // 'Essen'
        
        // Überprüfe den Button
        expect(screen.getByRole('button', { name: /Transaktion Speichern/i })).toBeInTheDocument();
    });
    
    // Test 2: Validierung schlägt fehl bei Betrag <= 0
    test('zeigt einen Alert und ruft onSubmit NICHT auf, wenn der Betrag <= 0 ist', () => {
        render(
            <TransactionForm 
                onSubmit={mockOnSubmit} 
                availableCategories={mockAvailableCategories} 
            />
        );

        const descriptionInput = screen.getByPlaceholderText('Beschreibung');
        const amountInput = screen.getByPlaceholderText('Betrag');
        const submitButton = screen.getByRole('button', { name: /Transaktion Speichern/i });

        // Daten eingeben, wobei der Betrag auf 0 bleibt
        fireEvent.change(descriptionInput, { target: { value: 'Test-Beschreibung' } });
        fireEvent.change(amountInput, { target: { value: '0' } });
        
        fireEvent.click(submitButton);

        // Überprüfe, ob der Alert aufgerufen wurde
        expect(mockAlert).toHaveBeenCalledTimes(1);
        expect(mockAlert).toHaveBeenCalledWith('Bitte alle Felder korrekt ausfüllen (Beschreibung, Betrag > 0, Kategorie).');
        
        // Überprüfe, ob onSubmit NICHT aufgerufen wurde
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    // Test 3: Erfolgreiches Absenden des Formulars und Zurücksetzen
    test('ruft onSubmit mit den korrekten Daten auf und setzt das Formular zurück', () => {
        render(
            <TransactionForm 
                onSubmit={mockOnSubmit} 
                availableCategories={mockAvailableCategories} 
            />
        );

        const descriptionInput = screen.getByPlaceholderText('Beschreibung');
        const amountInput = screen.getByPlaceholderText('Betrag');
        const typeSelect = screen.getByRole('combobox', { name: /type/i });
        const categorySelect = screen.getByRole('combobox', { name: /category/i });
        const submitButton = screen.getByRole('button', { name: /Transaktion Speichern/i });
        
        const testData = {
            description: 'Monatsgehalt',
            amount: 2500.50,
            type: 'Einnahme',
            category: 'Gehalt',
        };

        // 1. Daten in die Felder eingeben
        fireEvent.change(descriptionInput, { target: { value: testData.description } });
        fireEvent.change(amountInput, { target: { value: testData.amount } });
        fireEvent.change(typeSelect, { target: { value: testData.type } });
        fireEvent.change(categorySelect, { target: { value: testData.category } });
        
        // 2. Formular absenden
        fireEvent.click(submitButton);

        // 3. Überprüfen, ob onSubmit mit den korrekten Daten aufgerufen wurde
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
            ...testData,
            date: '2025-12-12', // Setzt durch jest.setSystemTime
        });

        // 4. Überprüfen, ob das Formular zurückgesetzt wurde
        // Beschreibung und Betrag sollten geleert/auf 0 gesetzt sein
        expect(descriptionInput).toHaveValue('');
        expect(amountInput).toHaveValue(0);
        // Typ sollte auf den Standardwert ('Ausgabe') zurückgesetzt sein
        expect(typeSelect).toHaveValue('Ausgabe');
        // Kategorie sollte auf den ersten Wert der Liste ('Essen') zurückgesetzt sein
        expect(categorySelect).toHaveValue(mockAvailableCategories[0]);
    });

    // Test 4: Überprüfung der Logik, wenn keine Kategorien verfügbar sind (edge case)
    test('setzt die Kategorie auf leeren String, wenn availableCategories leer ist', () => {
        render(
            <TransactionForm 
                onSubmit={mockOnSubmit} 
                availableCategories={[]} 
            />
        );
        
        // Die Kategorie sollte einen leeren Wert haben
        const categorySelect = screen.getByRole('combobox', { name: /category/i });
        expect(categorySelect).toHaveValue('');

        // Versuch, das Formular abzusenden, sollte fehlschlagen, da die Kategorie fehlt
        const submitButton = screen.getByRole('button', { name: /Transaktion Speichern/i });
        fireEvent.click(submitButton);
        
        expect(mockAlert).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });
});