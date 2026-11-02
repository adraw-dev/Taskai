// Tipos del esquema `public` de Supabase, en el mismo formato que genera
// `supabase gen types typescript`. Deben reflejar supabase/migrations: tras una
// migración, regenéralos con `npm run db:types` (requiere `supabase link`).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string;
          file_url: string;
          id: string;
          task_id: string;
          type: string | null;
        };
        Insert: {
          created_at?: string;
          file_url: string;
          id?: string;
          task_id: string;
          type?: string | null;
        };
        Update: {
          created_at?: string;
          file_url?: string;
          id?: string;
          task_id?: string;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      lists: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          due_date: string | null;
          id: string;
          is_completed: boolean;
          is_important: boolean;
          list_id: string | null;
          notes: string | null;
          parent_task_id: string | null;
          position: number;
          priority: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          due_date?: string | null;
          id?: string;
          is_completed?: boolean;
          is_important?: boolean;
          list_id?: string | null;
          notes?: string | null;
          parent_task_id?: string | null;
          position?: number;
          priority?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          due_date?: string | null;
          id?: string;
          is_completed?: boolean;
          is_important?: boolean;
          list_id?: string | null;
          notes?: string | null;
          parent_task_id?: string | null;
          position?: number;
          priority?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey";
            columns: ["parent_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
