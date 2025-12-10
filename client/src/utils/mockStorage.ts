/**
 * Mock storage utility for managing uploaded documents and their extraction results
 */

export type StoredDocument = {
    id: string;
    fileName: string;
    uploadedAt: string;
    fileData: string; // base64 encoded file
    extractionResult: unknown; // The extraction response JSON
};

const STORAGE_KEY = 'ocr_uploaded_documents';

/**
 * Get all stored documents from localStorage
 */
export const getAllDocuments = (): StoredDocument[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
};

/**
 * Save a new document with its extraction result
 */
export const saveDocument = async (
    file: File,
    extractionResult: unknown
): Promise<StoredDocument> => {
    try {
        // Convert file to base64
        const fileData = await fileToBase64(file);

        const newDoc: StoredDocument = {
            id: generateId(),
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            fileData,
            extractionResult,
        };

        const documents = getAllDocuments();
        documents.push(newDoc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

        return newDoc;
    } catch (error) {
        console.error('Error saving document:', error);
        throw error;
    }
};

/**
 * Delete a document by ID
 */
export const deleteDocument = (id: string): void => {
    try {
        const documents = getAllDocuments();
        const filtered = documents.filter(doc => doc.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = (id: string): StoredDocument | null => {
    const documents = getAllDocuments();
    return documents.find(doc => doc.id === id) || null;
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Generate a unique ID
 */
const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert base64 string back to File object
 */
export const base64ToFile = (base64: string, fileName: string): File => {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
};
