// src/components/CategoryManager.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryManager from './CategoryManager';
import '@testing-library/jest-dom'; // Für erweiterte Matcher wie toBeInTheDocument

// Mock-Funktionen für die Props
const mockOnAddCategory = jest.fn();
const mockOnDeleteCategory = jest.fn();
const initialCategories = ['Einkommen', 'Miete', 'Lebensmittel'];

describe('CategoryManager', () => {

    // Setzt die Mock-Funktionen vor jedem Test zurück, um saubere Zustände zu gewährleisten
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Überprüfung der korrekten Initial-Anzeige
    test('rendert den Titel und alle initialen Kategorien', () => {
        render(
            <CategoryManager
                categories={initialCategories}
                onAddCategory={mockOnAddCategory}
                onDeleteCategory={mockOnDeleteCategory}
            />
        );

        // Überprüft den Haupttitel
        expect(screen.getByText('Kategorien verwalten')).toBeInTheDocument();

        // Überprüft, ob alle initialen Kategorien angezeigt werden
        initialCategories.forEach(category => {
            expect(screen.getByText(category)).toBeInTheDocument();
        });

        // Überprüft, ob das Input-Feld und der Hinzufügen-Button vorhanden sind
        expect(screen.getByPlaceholderText('Neue Kategorie hinzufügen...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Hinzufügen' })).toBeInTheDocument();
    });

    // Test 2: Hinzufügen einer neuen Kategorie
    test('ruft onAddCategory mit dem korrekten Namen auf und leert das Input-Feld', () => {
        const newCategory = 'Transport';

        render(
            <CategoryManager
                categories={initialCategories}
                onAddCategory={mockOnAddCategory}
                onDeleteCategory={mockOnDeleteCategory}
            />
        );

        const input = screen.getByPlaceholderText('Neue Kategorie hinzufügen...');
        const addButton = screen.getByRole('button', { name: 'Hinzufügen' });

        // 1. Input-Wert ändern
        fireEvent.change(input, { target: { value: newCategory } });
        expect(input.value).toBe(newCategory);

        // 2. Formular absenden (oder Button klicken)
        fireEvent.click(addButton);

        // 3. Überprüfen, ob die onAddCategory Funktion mit dem neuen Namen aufgerufen wurde
        expect(mockOnAddCategory).toHaveBeenCalledTimes(1);
        expect(mockOnAddCategory).toHaveBeenCalledWith(newCategory);

        // 4. Überprüfen, ob das Input-Feld geleert wurde
        expect(input.value).toBe('');
    });

    // Test 3: Versuchen, eine bereits existierende Kategorie hinzuzufügen
    test('warnt bei Versuch, eine existierende Kategorie hinzuzufügen und ruft onAddCategory NICHT auf', () => {
        // Mockt die window.alert Funktion, um sie im Test zu überwachen
        const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

        const existingCategory = 'Miete';

        render(
            <CategoryManager
                categories={initialCategories}
                onAddCategory={mockOnAddCategory}
                onDeleteCategory={mockOnDeleteCategory}
            />
        );

        const input = screen.getByPlaceholderText('Neue Kategorie hinzufügen...');
        const addButton = screen.getByRole('button', { name: 'Hinzufügen' });

        // Input mit bereits existierendem Namen befüllen
        fireEvent.change(input, { target: { value: existingCategory } });
        fireEvent.click(addButton);

        // Überprüfen, ob onAddCategory NICHT aufgerufen wurde
        expect(mockOnAddCategory).not.toHaveBeenCalled();

        // Überprüfen, ob der Alert angezeigt wurde
        expect(mockAlert).toHaveBeenCalledTimes(1);
        expect(mockAlert).toHaveBeenCalledWith('Diese Kategorie existiert bereits.');

        // Bereinigung des Mocks
        mockAlert.mockRestore();
    });

    // Test 4: Löschen einer Kategorie
    test('ruft onDeleteCategory mit dem korrekten Namen auf, wenn der Lösch-Button geklickt wird', () => {
        const categoryToDelete = 'Lebensmittel';

        render(
            <CategoryManager
                categories={initialCategories}
                onAddCategory={mockOnAddCategory}
                onDeleteCategory={mockOnDeleteCategory}
            />
        );

        // Findet alle Lösch-Buttons ('-')
        // Da jeder Kategorie-Eintrag einen Lösch-Button hat, suchen wir den spezifischen, der zum Text gehört
        const categoryItem = screen.getByText(categoryToDelete).closest('li');
        const deleteButton = categoryItem.querySelector('button');

        // Lösch-Button klicken
        fireEvent.click(deleteButton);

        // Überprüfen, ob onDeleteCategory mit der korrekten Kategorie aufgerufen wurde
        expect(mockOnDeleteCategory).toHaveBeenCalledTimes(1);
        expect(mockOnDeleteCategory).toHaveBeenCalledWith(categoryToDelete);
    });
});