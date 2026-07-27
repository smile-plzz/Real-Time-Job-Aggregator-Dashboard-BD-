import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Job } from '../types';

export interface SavedJobRecord {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  link: string;
  category: string;
  savedAt: string;
}

export async function toggleSaveJobInFirestore(job: Job): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be signed in to save jobs.');
  }

  const userSavedJobsRef = collection(db, 'users', user.uid, 'savedJobs');
  const jobDocRef = doc(userSavedJobsRef, job.id);

  const path = `users/${user.uid}/savedJobs/${job.id}`;

  try {
    const payload = {
      userId: user.uid,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      location: job.location || 'Dhaka, Bangladesh',
      link: job.link,
      category: job.category || 'other',
      savedAt: new Date().toISOString()
    };

    await setDoc(jobDocRef, payload);
    return true; // saved
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function removeSavedJobFromFirestore(jobId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const jobDocRef = doc(db, 'users', user.uid, 'savedJobs', jobId);
  const path = `users/${user.uid}/savedJobs/${jobId}`;

  try {
    await deleteDoc(jobDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export function subscribeToSavedJobs(callback: (savedJobIds: string[]) => void) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }

  const userSavedJobsRef = collection(db, 'users', user.uid, 'savedJobs');
  const path = `users/${user.uid}/savedJobs`;

  return onSnapshot(
    userSavedJobsRef,
    (snapshot) => {
      const ids = snapshot.docs.map(d => d.id);
      callback(ids);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
