import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance using explicit database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Recursively remove `undefined` values from objects/arrays so Firestore doesn't reject writes.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Subscribe to a Firestore collection in real-time.
 * Synchronous snapshot listener to prevent state flickering and race conditions.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  initialSeedData?: T[]
) {
  const colRef = collection(db, collectionName);
  const seedKey = `seeded_${collectionName}`;
  let isSeeding = false;

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      if (initialSeedData && initialSeedData.length > 0 && !isSeeding && !localStorage.getItem(seedKey)) {
        isSeeding = true;
        localStorage.setItem(seedKey, 'true');
        console.log(`[Firebase] Initializing default seed data for ${collectionName}...`);
        const batch = writeBatch(db);
        initialSeedData.forEach((item) => {
          const itemRef = doc(db, collectionName, item.id);
          batch.set(itemRef, sanitizeForFirestore(item));
        });
        batch.commit().catch((err) => console.error(`[Firebase] Error seeding ${collectionName}:`, err));
        onData(initialSeedData);
        return;
      }
      onData([]);
      return;
    }

    // Collection contains data, mark as seeded so future deletions to empty don't re-seed
    localStorage.setItem(seedKey, 'true');

    const items: T[] = [];
    snapshot.forEach((document) => {
      items.push({ id: document.id, ...document.data() } as T);
    });
    onData(items);
  }, (error) => {
    console.error(`[Firebase] Snapshot error for ${collectionName}:`, error);
  });

  return unsubscribe;
}

/**
 * Save or update a single document in Firestore
 */
export async function saveFirebaseDoc<T extends { id: string }>(
  collectionName: string,
  data: T
) {
  try {
    localStorage.setItem(`seeded_${collectionName}`, 'true');
    const docRef = doc(db, collectionName, data.id);
    const cleanedData = sanitizeForFirestore(data);
    await setDoc(docRef, cleanedData, { merge: true });
    console.log(`[Firebase] Saved doc ${data.id} to ${collectionName}`);
  } catch (error) {
    console.error(`[Firebase] Error saving doc to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a single document from Firestore
 */
export async function deleteFirebaseDoc(collectionName: string, docId: string) {
  try {
    localStorage.setItem(`seeded_${collectionName}`, 'true');
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`[Firebase] Deleted doc ${docId} from ${collectionName}`);
  } catch (error) {
    console.error(`[Firebase] Error deleting doc ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Save an entire collection (batch set + delete removed documents)
 */
export async function saveFirebaseCollection<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  try {
    localStorage.setItem(`seeded_${collectionName}`, 'true');
    const colRef = collection(db, collectionName);
    const existingSnap = await getDocs(colRef);
    
    const batch = writeBatch(db);
    const newItemIds = new Set(items.map((i) => i.id));

    // Delete any documents that are no longer in the updated items list
    existingSnap.forEach((documentSnap) => {
      if (!newItemIds.has(documentSnap.id)) {
        batch.delete(doc(db, collectionName, documentSnap.id));
      }
    });

    // Write / update all current items
    items.forEach((item) => {
      const itemRef = doc(db, collectionName, item.id);
      const cleanedItem = sanitizeForFirestore(item);
      batch.set(itemRef, cleanedItem, { merge: true });
    });

    await batch.commit();
    console.log(`[Firebase] Saved batch collection ${collectionName} with ${items.length} items`);
  } catch (error) {
    console.error(`[Firebase] Error saving batch collection to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Subscribe to a single document (e.g., config, branch info)
 */
export function subscribeToDoc<T>(
  collectionName: string,
  docId: string,
  onData: (data: T) => void,
  initialSeedData?: T
) {
  const docRef = doc(db, collectionName, docId);
  let isSeeding = false;

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists() && initialSeedData && !isSeeding) {
      const seedKey = `seeded_${collectionName}_${docId}`;
      if (!localStorage.getItem(seedKey)) {
        isSeeding = true;
        localStorage.setItem(seedKey, 'true');
        console.log(`[Firebase] Seeding initial doc for ${collectionName}/${docId}...`);
        setDoc(docRef, sanitizeForFirestore(initialSeedData)).catch((err) => console.error(`[Firebase] Error seeding doc ${collectionName}/${docId}:`, err));
        onData(initialSeedData);
        return;
      }
    }

    if (docSnap.exists()) {
      onData(docSnap.data() as T);
    }
  }, (error) => {
    console.error(`[Firebase] Snapshot error for ${collectionName}/${docId}:`, error);
  });

  return unsubscribe;
}

/**
 * Save a single document without requiring an `id` field in T (e.g. config)
 */
export async function saveSingleDoc<T extends object>(
  collectionName: string,
  docId: string,
  data: T
) {
  try {
    const docRef = doc(db, collectionName, docId);
    const cleanedData = sanitizeForFirestore(data);
    await setDoc(docRef, cleanedData, { merge: true });
    console.log(`[Firebase] Saved single doc ${collectionName}/${docId}`);
  } catch (error) {
    console.error(`[Firebase] Error saving single doc ${collectionName}/${docId}:`, error);
    throw error;
  }
}
