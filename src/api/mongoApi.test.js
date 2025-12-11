// src/api/mongoApi.test.js
import { fetchTransactions, createTransaction, deleteTransaction } from './mongoApi';

// Mocking der globalen fetch-Funktion
global.fetch = jest.fn();

// Hilfsfunktion zum Zurücksetzen der fetch-Mocks
const mockFetch = (response, ok = true) => {
    fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok,
            status: ok ? 200 : 400,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response)),
        })
    );
};

describe('mongoApi', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: fetchTransactions
    test('fetchTransactions transforms document format correctly', async () => {
        const mockApiResponse = [
            { id: 'a1', content: { description: 'Test1', amount: 100 } },
            { id: 'b2', content: { description: 'Test2', amount: 200 } },
        ];
        
        mockFetch(mockApiResponse);

        const transactions = await fetchTransactions();

        // Prüfen, ob die Transformation korrekt stattfand (id auf oberster Ebene)
        expect(transactions).toEqual([
            { id: 'a1', description: 'Test1', amount: 100 },
            { id: 'b2', description: 'Test2', amount: 200 },
        ]);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Test 2: createTransaction
    test('createTransaction sends correct payload and returns mapped object', async () => {
        const newTransactionData = { description: 'Neu', amount: 50, type: 'Ausgabe' };
        const mockApiReturn = { id: 'c3', content: newTransactionData };

        mockFetch(mockApiReturn);

        const result = await createTransaction(newTransactionData);

        // Prüfen, ob die Nutzlast korrekt mit 'content' verpackt wurde
        expect(fetch).toHaveBeenCalledWith(expect.any(String), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newTransactionData }),
        });
        
        // Prüfen, ob das zurückgegebene Objekt korrekt gemappt wurde
        expect(result).toEqual({ id: 'c3', ...newTransactionData });
    });

    // Test 3: deleteTransaction
    test('deleteTransaction calls API with correct ID and method', async () => {
        mockFetch({}); // Löschen gibt leeres Objekt zurück

        await deleteTransaction('d4');

        // Prüfen, ob der korrekte Endpunkt mit der ID und der DELETE-Methode aufgerufen wurde
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/d4'),
            { method: 'DELETE' }
        );
    });

    // Test 4: Fehlerbehandlung
    test('handleResponse throws error on bad response (e.g., 400)', async () => {
        const errorBody = { message: 'Invalides Feld: Beschreibung fehlt.' };
        
        fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: () => Promise.resolve(errorBody),
            })
        );

        // Erwartet, dass der Aufruf fehlschlägt und die Fehlermeldung enthält
        await expect(fetchTransactions()).rejects.toThrow(
            'HTTP-Fehler 400: Invalides Feld: Beschreibung fehlt.'
        );
    });
});