import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User as FirebaseUser,
  sendPasswordResetEmail as sendReset,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification as sendVerificationEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  DocumentData,
  Firestore,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

interface UserRole {
  role: 'admin' | 'supervisor' | 'agent';
  permissions: string[];
}

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface CallData extends DocumentData {
  id: string;
  userId: string;
  audioUrl: string;
  emotions: Array<{
    name: string;
    confidence: number;
    timestamp: number;
  }>;
  metadata: {
    startTime: number;
    endTime: number;
    duration: number;
  };
  createdAt: string;
}

interface AdvancedAnalytics {
  totalCalls: number;
  totalDuration: number;
  emotionBreakdown: Record<string, number>;
  averageCallDuration: number;
  trendData: {
    date: string;
    callCount: number;
    averageDuration: number;
    dominantEmotion: string;
  }[];
  performanceMetrics: {
    positiveEmotionPercentage: number;
    averageCallsPerDay: number;
    peakCallTimes: { hour: number; count: number }[];
  };
}

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string;
  createdAt: Date;
  lastUpdated: Date;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private storage: FirebaseStorage;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  getCurrentUser(): AppUser | null {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update Firebase Auth profile
      await updateFirebaseProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      await setDoc(doc(this.db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null,
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendReset(this.auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  }

  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user: FirebaseUser | null) => {
      if (user) {
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        };
        callback(appUser);
      } else {
        callback(null);
      }
    });
  }

  // Call recording methods
  async saveCallRecording(userId: string, callData: {
    audioBlob: Blob,
    emotions: any[],
    metadata: {
      startTime: number,
      endTime: number,
      duration: number
    }
  }): Promise<string> {
    try {
      // Upload audio file to Firebase Storage
      const audioRef = ref(this.storage, `recordings/${userId}/${Date.now()}.webm`);
      await uploadBytes(audioRef, callData.audioBlob);
      const audioUrl = await getDownloadURL(audioRef);

      // Save call metadata to Firestore
      const callRef = await addDoc(collection(this.db, 'calls'), {
        userId,
        audioUrl,
        emotions: callData.emotions,
        ...callData.metadata,
        createdAt: new Date().toISOString()
      });

      return callRef.id;
    } catch (error: any) {
      console.error('Save call recording error:', error);
      throw new Error(error.message);
    }
  }

  // Analytics methods
  async getCallAnalytics(userId: string): Promise<any> {
    try {
      const calls = await this.getUserCalls(userId);
      
      // Calculate analytics
      const analytics = {
        totalCalls: calls.length,
        totalDuration: calls.reduce((acc, call) => acc + call.metadata.duration, 0),
        emotionBreakdown: this.calculateEmotionBreakdown(calls),
        averageCallDuration: calls.length > 0 
          ? calls.reduce((acc, call) => acc + call.metadata.duration, 0) / calls.length 
          : 0
      };

      return analytics;
    } catch (error: any) {
      console.error('Get call analytics error:', error);
      throw new Error(error.message);
    }
  }

  private calculateEmotionBreakdown(calls: any[]): Record<string, number> {
    const emotions: Record<string, number> = {};
    
    calls.forEach(call => {
      call.emotions.forEach((emotion: any) => {
        if (!emotions[emotion.name]) {
          emotions[emotion.name] = 0;
        }
        emotions[emotion.name]++;
      });
    });

    // Convert to percentages
    const total = Object.values(emotions).reduce((a, b) => a + b, 0);
    Object.keys(emotions).forEach(key => {
      emotions[key] = (emotions[key] / total) * 100;
    });

    return emotions;
  }

  // User roles and permissions
  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      return userDoc.data() as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async getUsersByRole(role: string): Promise<AppUser[]> {
    try {
      const usersQuery = query(
        collection(this.db, 'users'),
        where('role', '==', role)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        uid: doc.id,
        ...doc.data()
      })) as AppUser[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  async setUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      await setDoc(doc(this.db, 'users', userId), role);
    } catch (error) {
      console.error('Error setting user role:', error);
      throw error;
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role?.permissions.includes(permission) || false;
  }

  // Enhanced analytics methods
  async getAdvancedAnalytics(userId: string): Promise<AdvancedAnalytics> {
    try {
      const calls = await this.getUserCalls(userId);
      
      // Basic metrics
      const totalCalls = calls.length;
      const totalDuration = calls.reduce((acc, call) => acc + call.metadata.duration, 0);
      const averageCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

      // Emotion breakdown
      const emotionBreakdown = this.calculateEmotionBreakdown(calls);

      // Trend analysis
      const trendData = this.calculateTrendData(calls);

      // Performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(calls);

      return {
        totalCalls,
        totalDuration,
        emotionBreakdown,
        averageCallDuration,
        trendData,
        performanceMetrics
      };
    } catch (error) {
      console.error('Error getting advanced analytics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportCallData(userId: string, format: 'csv' | 'json'): Promise<string> {
    try {
      // Get user's calls from Firestore
      const callsRef = collection(this.db, 'calls');
      const q = query(callsRef, where('userId', '==', userId));
      const calls = await this.getUserCalls(userId);
      
      if (format === 'csv') {
        return this.generateCSV(calls);
      } else {
        return JSON.stringify(calls, null, 2);
      }
    } catch (error) {
      console.error('Error exporting call data:', error);
      throw error;
    }
  }

  // Real-time collaboration
  async shareCall(callId: string, targetUserId: string): Promise<void> {
    try {
      await addDoc(collection(this.db, 'shared_calls'), {
        callId,
        targetUserId,
        sharedAt: new Date().toISOString(),
        status: 'pending'
      });
    } catch (error) {
      console.error('Error sharing call:', error);
      throw error;
    }
  }

  async getSharedCalls(userId: string): Promise<CallData[]> {
    try {
      const sharedQuery = query(
        collection(this.db, 'shared_calls'),
        where('targetUserId', '==', userId)
      );
      
      const sharedDocs = await getDocs(sharedQuery);
      const callIds = sharedDocs.docs.map(doc => doc.data().callId);
      
      const calls: CallData[] = [];
      for (const callId of callIds) {
        const callDoc = await getDoc(doc(this.db, 'calls', callId));
        if (callDoc.exists()) {
          calls.push({ id: callDoc.id, ...callDoc.data() } as CallData);
        }
      }
      
      return calls;
    } catch (error) {
      console.error('Error getting shared calls:', error);
      throw error;
    }
  }

  // Helper methods
  private async getUserCalls(userId: string): Promise<CallData[]> {
    const callsQuery = query(
      collection(this.db, 'calls'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(callsQuery);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as CallData[];
  }

  private calculateTrendData(calls: CallData[]) {
    const trendMap = new Map<string, {
      callCount: number;
      totalDuration: number;
      emotions: Record<string, number>;
    }>();

    calls.forEach((call: CallData) => {
      const date = new Date(call.metadata.startTime).toISOString().split('T')[0];
      const current = trendMap.get(date) || {
        callCount: 0,
        totalDuration: 0,
        emotions: {}
      };

      current.callCount++;
      current.totalDuration += call.metadata.duration;
      
      call.emotions.forEach(emotion => {
        current.emotions[emotion.name] = (current.emotions[emotion.name] || 0) + 1;
      });

      trendMap.set(date, current);
    });

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      callCount: data.callCount,
      averageDuration: data.totalDuration / data.callCount,
      dominantEmotion: Object.entries(data.emotions)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral'
    }));
  }

  private calculatePerformanceMetrics(calls: CallData[]) {
    const positiveEmotions = ['happy', 'satisfied', 'pleased'];
    let totalEmotions = 0;
    let positiveCount = 0;
    const callsByHour = new Array(24).fill(0);

    calls.forEach(call => {
      const hour = new Date(call.metadata.startTime).getHours();
      callsByHour[hour]++;

      call.emotions.forEach(emotion => {
        totalEmotions++;
        if (positiveEmotions.includes(emotion.name.toLowerCase())) {
          positiveCount++;
        }
      });
    });

    const peakCallTimes = callsByHour
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      positiveEmotionPercentage: (positiveCount / totalEmotions) * 100,
      averageCallsPerDay: calls.length / this.getUniqueDays(calls),
      peakCallTimes
    };
  }

  private getUniqueDays(calls: CallData[]): number {
    const uniqueDays = new Set(
      calls.map(call => 
        new Date(call.metadata.startTime).toISOString().split('T')[0]
      )
    );
    return uniqueDays.size || 1;
  }

  private generateCSV(calls: CallData[]): string {
    const headers = [
      'Call ID',
      'Start Time',
      'Duration',
      'Dominant Emotion',
      'Positive Emotion %',
      'Number of Emotions'
    ];

    const rows = calls.map(call => {
      const dominantEmotion = this.getDominantEmotion(call.emotions);
      const positivePercentage = this.getPositiveEmotionPercentage(call.emotions);

      return [
        call.id,
        new Date(call.metadata.startTime).toISOString(),
        call.metadata.duration / 1000, // Convert to seconds
        dominantEmotion,
        positivePercentage.toFixed(2),
        call.emotions.length
      ];
    });

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private getDominantEmotion(emotions: Array<{ name: string; confidence: number }>) {
    return emotions.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    ).name;
  }

  private getPositiveEmotionPercentage(emotions: Array<{ name: string; confidence: number }>) {
    const positiveEmotions = ['happy', 'satisfied', 'pleased'];
    const positiveCount = emotions.filter(e => 
      positiveEmotions.includes(e.name.toLowerCase())
    ).length;
    return (positiveCount / emotions.length) * 100;
  }

  async updateProfile(profile: { displayName?: string; photoURL?: string }): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    try {
      // Update Firebase Auth profile
      await updateFirebaseProfile(user, profile);

      // Update Firestore document
      const userRef = doc(this.db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profile,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateProfilePicture(dataUrl: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    try {
      // Update Firebase Auth profile
      await updateFirebaseProfile(user, {
        photoURL: dataUrl
      });

      // Update Firestore document
      const userRef = doc(this.db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: dataUrl,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No user is signed in or email is missing');
    }

    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updateFirebasePassword(user, newPassword);
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message);
    }
  }

  async sendEmailVerification(): Promise<void> {
    if (!this.auth.currentUser) {
      throw new Error('No user is signed in');
    }

    try {
      await sendVerificationEmail(this.auth.currentUser);
    } catch (error: any) {
      console.error('Send email verification error:', error);
      throw new Error(error.message);
    }
  }
}

export const firebaseService = new FirebaseService(); 