import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
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
 * Subscribe to a Firestore collection in real-time.
 * If the collection is completely empty and hasn't been initialized yet, seed it with initial default data.
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  initialSeedData?: T[]
) {
  const colRef = collection(db, collectionName);

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialSeedData && initialSeedData.length > 0) {
      // Check if this collection has already been initialized/seeded
      try {
        const markerRef = doc(db, 'appConfig', `seeded_${collectionName}`);
        const markerSnap = await getDoc(markerRef);
        if (!markerSnap.exists()) {
          console.log(`[Firebase] Initializing seed data for ${collectionName}...`);
          const batch = writeBatch(db);
          initialSeedData.forEach((item) => {
            const itemRef = doc(db, collectionName, item.id);
            batch.set(itemRef, item);
          });
          batch.set(markerRef, { seeded: true, timestamp: new Date().toISOString() });
          await batch.commit();
          return; // Listener will trigger again after batch write
        }
      } catch (err) {
        console.error(`[Firebase] Error checking seed marker for ${collectionName}:`, err);
      }
    }

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
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
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
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
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
      batch.set(itemRef, item, { merge: true });
    });

    // Mark collection as initialized/seeded in Firestore
    const markerRef = doc(db, 'appConfig', `seeded_${collectionName}`);
    batch.set(markerRef, { seeded: true, timestamp: new Date().toISOString() });

    await batch.commit();
  } catch (error) {
    console.error(`[Firebase] Error saving batch collection to ${collectionName}:`, error);
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

  const unsubscribe = onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists() && initialSeedData) {
      console.log(`[Firebase] Seeding initial doc for ${collectionName}/${docId}...`);
      await setDoc(docRef, initialSeedData);
      return;
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
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`[Firebase] Error saving single doc ${collectionName}/${docId}:`, error);
  }
}
