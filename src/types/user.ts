export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  bio: string;
  photoURL: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    dribbble?: string;
    github?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserStats {
  cardsReported: number;
  cardsFound: number;
  rewardPoints: number;
}

export interface UserRewards {
  points: number;
  level: string;
  badges: string[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
}

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  occupation?: string;
  bio?: string;
  photoURL?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    dribbble?: string;
    github?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}
