import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import db from "./firestore";
import { UserProfile, UserStats, UserDocument } from "@/types/user";

const DEFAULT_AVATAR = "/images/user/spartan.jpg";

/**
 * Fetches user profile data from Firestore or creates a default profile from Firebase Auth
 * @param user - Firebase Auth user object
 * @returns UserProfile object with complete user data
 */
export const fetchUserProfile = async (user: User): Promise<UserProfile> => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const firestoreData = userDocSnap.data() as UserDocument;
      return {
        name: firestoreData.name || user.displayName || "User",
        email: firestoreData.email || user.email || "",
        phone: firestoreData.phone || user.phoneNumber || "",
        occupation: firestoreData.occupation || "Not specified",
        bio: firestoreData.bio || "No bio available",
        photoURL: firestoreData.photoURL || user.photoURL || DEFAULT_AVATAR,
        socialLinks: firestoreData.socialLinks || {},
      };
    } else {
      // Create a new user document with default values
      const newUserProfile: UserProfile = {
        name: user.displayName || "User",
        email: user.email || "",
        phone: user.phoneNumber || "",
        occupation: "Not specified",
        bio: "No bio available",
        photoURL: user.photoURL || "/images/user/spartan.jpg",
        socialLinks: {},
      };

      await createUserDocument(user, newUserProfile);
      return newUserProfile;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Return basic profile from Firebase Auth as fallback
    return {
      name: user.displayName || "User",
      email: user.email || "",
      phone: user.phoneNumber || "",
      occupation: "Not specified",
      bio: "No bio available",
      photoURL: user.photoURL || DEFAULT_AVATAR,
      socialLinks: {},
    };
  }
};

/**
 * Creates a new user document in Firestore
 * @param user - Firebase Auth user object
 * @param profileData - Additional profile data
 */
export const createUserDocument = async (
  user: User,
  profileData: Partial<UserProfile>,
): Promise<void> => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocument: UserDocument = {
    uid: user.uid,
    name: profileData.name || user.displayName || "User",
    email: user.email || "",
    phone: profileData.phone || user.phoneNumber || "",
    occupation: profileData.occupation || "Not specified",
    bio: profileData.bio || "No bio available",
    photoURL: profileData.photoURL || user.photoURL || DEFAULT_AVATAR,
    socialLinks: profileData.socialLinks || {},
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    preferences: {
      notifications: true,
      darkMode: false,
      language: "en",
    },
  };

  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      ...userDocument,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

/**
 * Updates user profile data in Firestore
 * @param userId - User's unique ID
 * @param updates - Profile data to update
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Fetches user statistics from various collections
 * @param userId - User's unique ID
 * @returns UserStats object with user activity statistics
 */
export const fetchUserStats = async (userId: string): Promise<UserStats> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const defaultStats: UserStats = {
    cardsReported: 0,
    cardsFound: 0,
    rewardPoints: 0,
  };

  try {
    // Fetch cards reported by user
    const reportedCardsQuery = query(
      collection(db, "reportedCards"),
      where("reportedBy", "==", userId),
    );
    const reportedCardsSnap = await getDocs(reportedCardsQuery);
    const cardsReported = reportedCardsSnap.size;

    // Fetch cards found by user
    const foundCardsQuery = query(
      collection(db, "foundCards"),
      where("foundBy", "==", userId),
    );
    const foundCardsSnap = await getDocs(foundCardsQuery);
    const cardsFound = foundCardsSnap.size;

    // Fetch user rewards/points
    const userRewardsRef = doc(db, "userRewards", userId);
    const userRewardsSnap = await getDoc(userRewardsRef);
    const rewardPoints = userRewardsSnap.exists()
      ? userRewardsSnap.data().points || 0
      : 0;

    return {
      cardsReported,
      cardsFound,
      rewardPoints,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return defaultStats;
  }
};

/**
 * Updates user reward points
 * @param userId - User's unique ID
 * @param points - Number of points to add (can be negative to subtract)
 */
export const updateUserRewards = async (
  userId: string,
  points: number,
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const userRewardsRef = doc(db, "userRewards", userId);
    const userRewardsSnap = await getDoc(userRewardsRef);

    if (userRewardsSnap.exists()) {
      const currentPoints = userRewardsSnap.data().points || 0;
      await updateDoc(userRewardsRef, {
        points: Math.max(0, currentPoints + points), // Ensure points don't go negative
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new rewards document
      await setDoc(userRewardsRef, {
        points: Math.max(0, points),
        level: "Bronze",
        badges: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error updating user rewards:", error);
    throw error;
  }
};

/**
 * Validates user profile data
 * @param profile - UserProfile object to validate
 * @returns Array of validation errors (empty if valid)
 */
export const validateUserProfile = (
  profile: Partial<UserProfile>,
): string[] => {
  const errors: string[] = [];

  if (profile.name && profile.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) {
    errors.push("Invalid email format");
  }

  if (profile.phone && !/^\+?[\d\s\-\(\)]+$/.test(profile.phone)) {
    errors.push("Invalid phone number format");
  }

  if (profile.bio && profile.bio.length > 500) {
    errors.push("Bio must be less than 500 characters");
  }

  // Validate social links
  if (profile.socialLinks) {
    Object.entries(profile.socialLinks).forEach(([platform, url]) => {
      if (url && !isValidUrl(url)) {
        errors.push(`Invalid ${platform} URL`);
      }
    });
  }

  return errors;
};

/**
 * Validates URL format
 * @param url - URL string to validate
 * @returns Boolean indicating if URL is valid
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Formats user display name
 * @param user - Firebase Auth user or UserProfile
 * @returns Formatted display name
 */
export const formatUserDisplayName = (user: User | UserProfile): string => {
  if ("displayName" in user) {
    // Firebase Auth user
    return user.displayName || user.email?.split("@")[0] || "User";
  } else {
    // UserProfile
    return user.name || "User";
  }
};

/**
 * Gets user initials for avatar
 * @param name - User's full name
 * @returns User's initials (max 2 characters)
 */
export const getUserInitials = (name: string): string => {
  if (!name || name.trim().length === 0) {
    return "U";
  }

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Checks if user profile is complete
 * @param profile - UserProfile object
 * @returns Boolean indicating if profile has all required fields
 */
export const isProfileComplete = (profile: UserProfile): boolean => {
  const requiredFields = ["name", "email"];
  return requiredFields.every(
    (field) =>
      profile[field as keyof UserProfile] &&
      String(profile[field as keyof UserProfile]).trim().length > 0,
  );
};
