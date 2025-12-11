// src/api/mongoApi.js

// KORREKTE URL: {collectionName}/documents
const API_BASE_URL = 'http://localhost:8080/transactions/documents'; 

// Hilfsfunktion zur Behandlung von HTTP-Fehlern
const handleResponse = async (response) => {
    if (!response.ok) {
        // Versucht, die Fehlermeldung vom Server zu lesen, falls vorhanden
        let errorBody;
        try {
            // Die Fehlermeldung wird vom Spring Boot Controller im Body zurückgegeben
            errorBody = await response.json(); 
        } catch (e) {
            // Wenn keine JSON-Antwort, generische Nachricht
            errorBody = { message: 'Unbekannter API-Fehler beim Lesen des Response Bodies.' };
        }
        
        // Versucht, eine spezifische Fehlermeldung aus dem Body zu extrahieren
        let errorMessage = errorBody.message || JSON.stringify(errorBody);
        
        throw new Error(`HTTP-Fehler ${response.status}: ${errorMessage || response.statusText}`);
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
    // Der Rückgabewert des Backends ist ein Array von GenericDocument-Objekten.
    // Wir mappen diese auf das gewünschte Transaktionsobjekt:
    return data.map(doc => ({
        // Die ID ist direkt im Document-Objekt
        id: doc.id, 
        // Der Rest der Daten ist im Content-Objekt
        ...doc.content 
    }));
};

/**
 * Erstellt eine neue Transaktion (POST).
 * Ersetzt die ursprüngliche addTransaction Funktion.
 * @param {object} transactionData - Das Transaktionsobjekt (z.B. {amount: 50, description: "..."}).
 */
export const createTransaction = async (transactionData) => {
    
    // WICHTIG: Das Objekt MUSS im 'content'-Attribut verpackt werden.
    const payload = {
        content: transactionData
    };
    
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), 
    });

    await handleResponse(response);

    const data = await response.json();
    
    // Wir geben die neue Transaktion mit der vom Server generierten ID zurück.
    return {
        id: data.id, 
        ...data.content
    };
};

/**
 * Löscht eine Transaktion (DELETE).
 * @param {string} id - Die ID des zu löschenden Dokuments.
 */
export const deleteTransaction = async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    
    // Der Controller gibt 200 bei Erfolg und 404 bei Nicht-Finden zurück,
    // beides wird durch handleResponse abgedeckt (200 ist ok).
    await handleResponse(response);
};