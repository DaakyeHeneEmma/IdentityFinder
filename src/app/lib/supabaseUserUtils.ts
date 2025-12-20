import { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseConfig";
import { Database } from "@/types/supabase";
import { UserProfile, UserStats } from "@/types/user";

type DatabaseUser = Database["public"]["Tables"]["users"]["Row"];
type DatabaseUserInsert = Database["public"]["Tables"]["users"]["Insert"];
type DatabaseUserUpdate = Database["public"]["Tables"]["users"]["Update"];

const DEFAULT_AVATAR = "/images/user/spartan.jpg";

/**
 * Fetches user profile data from Supabase or creates a default profile from Supabase Auth
 * @param user - Supabase Auth user object
 * @returns UserProfile object with complete user data
 */
export const fetchUserProfile = async (user: User): Promise<UserProfile> => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) {
      // Convert Supabase user data to UserProfile format
      return {
        name: data.name || user.user_metadata?.name || "User",
        email: data.email || user.email || "",
        phone: data.phone || user.phone || "",
        occupation: data.occupation || "Not specified",
        bio: data.bio || "No bio available",
        photoURL:
          data.photo_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          DEFAULT_AVATAR,
        socialLinks: (data.social_links as UserProfile["socialLinks"]) || {},
      };
    } else {
      // Create a new user profile with default values
      const newUserProfile: UserProfile = {
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        phone: user.phone || "",
        occupation: "Not specified",
        bio: "No bio available",
        photoURL:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          DEFAULT_AVATAR,
        socialLinks: {},
      };

      await createUserDocument(user, newUserProfile);
      return newUserProfile;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Return basic profile from Supabase Auth as fallback
    return {
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      phone: user.phone || "",
      occupation: "Not specified",
      bio: "No bio available",
      photoURL:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        DEFAULT_AVATAR,
      socialLinks: {},
    };
  }
};

/**
 * Creates a new user document in Supabase
 * @param user - Supabase Auth user object
 * @param profileData - Additional profile data
 */
export const createUserDocument = async (
  user: User,
  profileData: Partial<UserProfile>,
): Promise<void> => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocument: DatabaseUserInsert = {
    id: user.id,
    email: user.email!,
    name:
      profileData.name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User",
    phone: profileData.phone || user.phone || null,
    occupation: profileData.occupation || "Not specified",
    bio: profileData.bio || "No bio available",
    photo_url:
      profileData.photoURL ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      DEFAULT_AVATAR,
    social_links: profileData.socialLinks || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
  };

  try {
    const { error } = await supabase.from("users").insert(userDocument);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
};

/**
 * Updates user profile data in Supabase
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
    const updateData: DatabaseUserUpdate = {
      updated_at: new Date().toISOString(),
    };

    // Map UserProfile fields to database fields
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.occupation !== undefined)
      updateData.occupation = updates.occupation;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.photoURL !== undefined) updateData.photo_url = updates.photoURL;
    if (updates.socialLinks !== undefined)
      updateData.social_links = updates.socialLinks;

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Fetches user statistics from various tables using parallel queries
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
    // Execute all queries in parallel for better performance
    const [reportedCardsResult, foundCardsResult, rewardsResult] =
      await Promise.allSettled([
        supabase
          .from("reported_cards")
          .select("*", { count: "exact", head: true })
          .eq("reported_by", userId),

        supabase
          .from("found_cards")
          .select("*", { count: "exact", head: true })
          .eq("found_by", userId),

        supabase
          .from("user_rewards")
          .select("points")
          .eq("user_id", userId)
          .single(),
      ]);

    // Extract results with error handling
    const reportedCount =
      reportedCardsResult.status === "fulfilled" &&
      !reportedCardsResult.value.error
        ? reportedCardsResult.value.count || 0
        : 0;

    const foundCount =
      foundCardsResult.status === "fulfilled" && !foundCardsResult.value.error
        ? foundCardsResult.value.count || 0
        : 0;

    const rewardPoints =
      rewardsResult.status === "fulfilled" && !rewardsResult.value.error
        ? rewardsResult.value.data?.points || 0
        : 0;

    return {
      cardsReported: reportedCount,
      cardsFound: foundCount,
      rewardPoints: rewardPoints,
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
    // First, try to get existing rewards
    const { data: existingRewards, error: fetchError } = await supabase
      .from("user_rewards")
      .select("points")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingRewards) {
      // Update existing rewards
      const newPoints = Math.max(0, existingRewards.points + points);
      const { error: updateError } = await supabase
        .from("user_rewards")
        .update({
          points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new rewards record
      const { error: insertError } = await supabase
        .from("user_rewards")
        .insert({
          user_id: userId,
          points: Math.max(0, points),
          level: "Bronze",
          badges: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error updating user rewards:", error);
    throw error;
  }
};

/**
 * Fetches complete user data (profile + stats) in a single optimized call
 * @param user - Supabase Auth user object
 * @returns Combined user profile and stats data
 */
export const fetchCompleteUserData = async (
  user: User,
): Promise<{
  profile: UserProfile;
  stats: UserStats;
}> => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Execute all queries in parallel for maximum performance
    const [
      userProfileResult,
      reportedCardsResult,
      foundCardsResult,
      rewardsResult,
    ] = await Promise.allSettled([
      supabase.from("users").select("*").eq("id", user.id).single(),

      supabase
        .from("reported_cards")
        .select("id", { count: "exact", head: true })
        .eq("reported_by", user.id),

      supabase
        .from("found_cards")
        .select("id", { count: "exact", head: true })
        .eq("found_by", user.id),

      supabase
        .from("user_rewards")
        .select("points")
        .eq("user_id", user.id)
        .single(),
    ]);

    // Process profile data
    let profile: UserProfile;
    if (
      userProfileResult.status === "fulfilled" &&
      !userProfileResult.value.error &&
      userProfileResult.value.data
    ) {
      const data = userProfileResult.value.data;
      profile = {
        name: data.name || user.user_metadata?.name || "User",
        email: data.email || user.email || "",
        phone: data.phone || user.phone || "",
        occupation: data.occupation || "Not specified",
        bio: data.bio || "No bio available",
        photoURL:
          data.photo_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          DEFAULT_AVATAR,
        socialLinks: (data.social_links as UserProfile["socialLinks"]) || {},
      };
    } else {
      // Create profile from auth data and save it
      profile = {
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        phone: user.phone || "",
        occupation: "Not specified",
        bio: "No bio available",
        photoURL:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          DEFAULT_AVATAR,
        socialLinks: {},
      };

      // Create user profile in background (don't await to avoid blocking)
      createUserDocument(user, profile).catch((err) =>
        console.error("Background profile creation failed:", err),
      );
    }

    // Process stats data
    const reportedCount =
      reportedCardsResult.status === "fulfilled" &&
      !reportedCardsResult.value.error
        ? reportedCardsResult.value.count || 0
        : 0;

    const foundCount =
      foundCardsResult.status === "fulfilled" && !foundCardsResult.value.error
        ? foundCardsResult.value.count || 0
        : 0;

    const rewardPoints =
      rewardsResult.status === "fulfilled" && !rewardsResult.value.error
        ? rewardsResult.value.data?.points || 0
        : 0;

    const stats: UserStats = {
      cardsReported: reportedCount,
      cardsFound: foundCount,
      rewardPoints: rewardPoints,
    };

    return { profile, stats };
  } catch (error) {
    console.error("Error fetching complete user data:", error);

    // Return fallback data
    const fallbackProfile: UserProfile = {
      name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      phone: user.phone || "",
      occupation: "Not specified",
      bio: "No bio available",
      photoURL:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        DEFAULT_AVATAR,
      socialLinks: {},
    };

    const fallbackStats: UserStats = {
      cardsReported: 0,
      cardsFound: 0,
      rewardPoints: 0,
    };

    return { profile: fallbackProfile, stats: fallbackStats };
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
 * @param user - Supabase Auth user or UserProfile
 * @returns Formatted display name
 */
export const formatUserDisplayName = (user: User | UserProfile): string => {
  if ("user_metadata" in user) {
    // Supabase Auth user
    return user.user_metadata?.name || user.email?.split("@")[0] || "User";
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

/**
 * Creates a reported card entry
 * @param userId - User's unique ID
 * @param cardData - Card data to insert
 */
export const createReportedCard = async (
  userId: string,
  cardData: {
    title: string;
    description?: string;
    cardType: string;
    fullName: string;
    phoneNumber?: string;
    email?: string;
    idNumber?: string;
    dateLost?: string;
    locationLost?: string;
    additionalInfo?: string;
  },
): Promise<{ id: string } | { error: Error }> => {
  try {
    const { data, error } = await supabase
      .from("reported_cards")
      .insert({
        title: cardData.title,
        description: cardData.description || null,
        card_type: cardData.cardType,
        full_name: cardData.fullName,
        phone_number: cardData.phoneNumber || null,
        email: cardData.email || null,
        id_number: cardData.idNumber || null,
        date_lost: cardData.dateLost || null,
        location_lost: cardData.locationLost || null,
        additional_info: cardData.additionalInfo || null,
        status: "active",
        reported_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return { error: new Error(error.message) };
    }

    return { id: data.id };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Creates a found card entry
 * @param userId - User's unique ID
 * @param cardData - Card data to insert
 */
export const createFoundCard = async (
  userId: string,
  cardData: {
    title: string;
    description?: string;
    cardType: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    idNumber?: string;
    dateFound?: string;
    locationFound?: string;
    additionalInfo?: string;
  },
): Promise<{ id: string } | { error: Error }> => {
  try {
    const { data, error } = await supabase
      .from("found_cards")
      .insert({
        title: cardData.title,
        description: cardData.description || null,
        card_type: cardData.cardType,
        full_name: cardData.fullName || null,
        phone_number: cardData.phoneNumber || null,
        email: cardData.email || null,
        id_number: cardData.idNumber || null,
        date_found: cardData.dateFound || null,
        location_found: cardData.locationFound || null,
        additional_info: cardData.additionalInfo || null,
        status: "active",
        found_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return { error: new Error(error.message) };
    }

    return { id: data.id };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Gets all reported cards
 * @param userId - Optional user ID to filter by
 * @returns Array of reported cards
 */
export const getReportedCards = async (userId?: string) => {
  try {
    let query = supabase
      .from("reported_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("reported_by", userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching reported cards:", error);
    return [];
  }
};

/**
 * Gets all found cards
 * @param userId - Optional user ID to filter by
 * @returns Array of found cards
 */
export const getFoundCards = async (userId?: string) => {
  try {
    let query = supabase
      .from("found_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("found_by", userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching found cards:", error);
    return [];
  }
};

/**
 * Deletes a card (reported or found) by ID
 * @param tableName - Either "reported_cards" or "found_cards"
 * @param cardId - ID of the card to delete
 * @param userId - User ID to verify ownership
 */
export const deleteCard = async (
  tableName: "reported_cards" | "found_cards",
  cardId: string,
  userId: string,
): Promise<{ error: Error | null }> => {
  try {
    const ownershipField =
      tableName === "reported_cards" ? "reported_by" : "found_by";

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("id", cardId)
      .eq(ownershipField, userId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
