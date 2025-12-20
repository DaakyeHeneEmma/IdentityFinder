export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          occupation: string | null;
          bio: string | null;
          photo_url: string | null;
          social_links: Json | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          occupation?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          occupation?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          social_links?: Json | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      reported_cards: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          card_type: string;
          full_name: string;
          phone_number: string | null;
          email: string | null;
          id_number: string | null;
          date_lost: string | null;
          location_lost: string | null;
          additional_info: string | null;
          status: string;
          reported_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          card_type: string;
          full_name: string;
          phone_number?: string | null;
          email?: string | null;
          id_number?: string | null;
          date_lost?: string | null;
          location_lost?: string | null;
          additional_info?: string | null;
          status?: string;
          reported_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          card_type?: string;
          full_name?: string;
          phone_number?: string | null;
          email?: string | null;
          id_number?: string | null;
          date_lost?: string | null;
          location_lost?: string | null;
          additional_info?: string | null;
          status?: string;
          reported_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reported_cards_reported_by_fkey";
            columns: ["reported_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      found_cards: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          card_type: string;
          full_name: string | null;
          phone_number: string | null;
          email: string | null;
          id_number: string | null;
          date_found: string | null;
          location_found: string | null;
          additional_info: string | null;
          status: string;
          found_by: string;
          claimed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          card_type: string;
          full_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          id_number?: string | null;
          date_found?: string | null;
          location_found?: string | null;
          additional_info?: string | null;
          status?: string;
          found_by: string;
          claimed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          card_type?: string;
          full_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          id_number?: string | null;
          date_found?: string | null;
          location_found?: string | null;
          additional_info?: string | null;
          status?: string;
          found_by?: string;
          claimed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "found_cards_found_by_fkey";
            columns: ["found_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "found_cards_claimed_by_fkey";
            columns: ["claimed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_rewards: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          level: string;
          badges: string[];
          achievements: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points?: number;
          level?: string;
          badges?: string[];
          achievements?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points?: number;
          level?: string;
          badges?: string[];
          achievements?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_rewards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          reported_card_id: string;
          found_card_id: string;
          match_score: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reported_card_id: string;
          found_card_id: string;
          match_score?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reported_card_id?: string;
          found_card_id?: string;
          match_score?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_reported_card_id_fkey";
            columns: ["reported_card_id"];
            isOneToOne: false;
            referencedRelation: "reported_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_found_card_id_fkey";
            columns: ["found_card_id"];
            isOneToOne: false;
            referencedRelation: "found_cards";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      card_status: "active" | "claimed" | "expired";
      match_status: "pending" | "confirmed" | "rejected";
      user_level: "Bronze" | "Silver" | "Gold" | "Platinum";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;

// Convenience types for easier usage
export type User = Tables<"users">;
export type ReportedCard = Tables<"reported_cards">;
export type FoundCard = Tables<"found_cards">;
export type UserReward = Tables<"user_rewards">;
export type Match = Tables<"matches">;

export type UserInsert = TablesInsert<"users">;
export type ReportedCardInsert = TablesInsert<"reported_cards">;
export type FoundCardInsert = TablesInsert<"found_cards">;
export type UserRewardInsert = TablesInsert<"user_rewards">;
export type MatchInsert = TablesInsert<"matches">;

export type UserUpdate = TablesUpdate<"users">;
export type ReportedCardUpdate = TablesUpdate<"reported_cards">;
export type FoundCardUpdate = TablesUpdate<"found_cards">;
export type UserRewardUpdate = TablesUpdate<"user_rewards">;
export type MatchUpdate = TablesUpdate<"matches">;
