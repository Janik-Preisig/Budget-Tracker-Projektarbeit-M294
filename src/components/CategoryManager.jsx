// src/components/CategoryManager.jsx

import React, { useState } from 'react';

function CategoryManager({ categories, onAddCategory, onDeleteCategory }) {
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        const trimmedName = newCategoryName.trim();
        if (trimmedName && !categories.includes(trimmedName)) {
            // Ruft die Funktion in TransactionTracker auf
            onAddCategory(trimmedName);
            setNewCategoryName(''); // Input leeren
        } else if (categories.includes(trimmedName)) {
            alert("Diese Kategorie existiert bereits.");
        }
    };

    return (
        <div className="category-manager">
            <h3>Kategorien verwalten</h3>
            
            {/* Formular zum Hinzufügen einer neuen Kategorie */}
            <form onSubmit={handleAdd} className="add-category-form">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Neue Kategorie hinzufügen..."
                    required
                />
                <button type="submit" style={{ marginLeft: '10px' }}>
                    Hinzufügen
                </button>
            </form>

            {/* Liste der aktuellen Kategorien */}
            <ul className="category-list">
                {categories.map((category) => (
                    <li key={category}>
                        <span>{category}</span>
                        {/* Lösch-Button */}
                        <button 
                            onClick={() => onDeleteCategory(category)}
                            style={{ marginLeft: '10px', backgroundColor: '#f44336', color: 'white' }}
                        >
                            -
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CategoryManager;