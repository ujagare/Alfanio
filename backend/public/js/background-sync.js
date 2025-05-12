// Background sync for forms
class FormSync {
  constructor() {
    this.dbName = 'alfanio-form-sync';
    this.storeName = 'pending-submissions';
    this.dbVersion = 1;
    this.db = null;
    this.init();
  }

  // Initialize the database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          console.log('Object store created');
        }
      };
    });
  }

  // Save form data for later submission
  async saveFormData(formType, formData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const data = {
        formType,
        formData,
        timestamp: new Date().toISOString()
      };

      const request = store.add(data);

      request.onsuccess = () => {
        console.log('Form data saved for background sync');
        resolve(true);
      };

      request.onerror = (event) => {
        console.error('Error saving form data:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Get all pending form submissions
  async getPendingSubmissions() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        console.error('Error getting pending submissions:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Remove a form submission after successful sync
  async removeSubmission(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log(`Submission ${id} removed after successful sync`);
        resolve(true);
      };

      request.onerror = (event) => {
        console.error(`Error removing submission ${id}:`, event.target.error);
        reject(event.target.error);
      };
    });
  }
}

// Register the sync event in the service worker
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    // Register background sync
    registration.sync.register('sync-forms').catch(err => {
      console.error('Background sync registration failed:', err);
    });
  });
}

// Export the FormSync class
window.FormSync = new FormSync();
