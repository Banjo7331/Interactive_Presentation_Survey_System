import FingerprintJS from '@fingerprintjs/fingerprintjs';


export const getDeviceId = async (): Promise<string> => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const visitorId = result.visitorId;

    // Store fingerprint in IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("deviceDatabase", 1);

      request.onerror = function(event) {
        console.error("Database error:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onupgradeneeded = function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("devices", { keyPath: "id" });
      };

      request.onsuccess = function(event) {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["devices"], "readwrite");
        const store = transaction.objectStore("devices");

        const getRequest = store.get(visitorId);

        getRequest.onsuccess = function() {
          if (!getRequest.result) {
            const addRequest = store.add({ id: visitorId });
            addRequest.onsuccess = function() {
              console.log("Device ID saved to IndexedDB");
              resolve(visitorId);
            };
          } else {
            console.log("Existing Device ID:", getRequest.result.id);
            resolve(getRequest.result.id);
          }
        };

        getRequest.onerror = function(event) {
          console.error("Get request error:", (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      };
    });
  };