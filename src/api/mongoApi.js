// src/api/mongoApi.js
// KEINE externen Imports nötig!

const API_BASE_URL = 'http://localhost:8080/transactions'; // NEU

// Hilfsfunktion zur Behandlung von HTTP-Fehlern
const handleResponse = async (response) => {
    if (!response.ok) {
        // Versucht, die Fehlermeldung vom Server zu lesen, falls vorhanden
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = { message: 'Unbekannter API-Fehler' };
        }
        throw new Error(`HTTP-Fehler ${response.status}: ${errorBody.message || response.statusText}`);
    }
    return response;
};

/**
 * Holt alle Transaktionen (GET).
 */
export const fetchTransactions = async () => {
    const response = await fetch(API_BASE_URL);
    await handleResponse(response);
    
    const data = await response.json();
    
    // Transformation: Extrahieren des 'content' und der 'id'
    return data.data.map(doc => ({
        id: doc.id, 
        ...doc.content 
    }));
};

/**
 * Fügt eine neue Transaktion hinzu (POST).
 */
export const addTransaction = async (transactionData) => {
    const payload = {
        content: transactionData // Verpackt im 'content'-Feld
    };
    
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload) 
    });

    await handleResponse(response);
};

/**
 * Löscht eine Transaktion (DELETE).
 */
export const deleteTransaction = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    
    await handleResponse(response);
};