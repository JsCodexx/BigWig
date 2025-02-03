export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'surveyor' | 'client'
          full_name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'surveyor' | 'client'
          full_name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'surveyor' | 'client'
          full_name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      surveys: {
        Row: {
          id: string
          title: string
          description: string | null
          client_id: string
          surveyor_id: string | null
          status: 'pending' | 'assigned' | 'submitted' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          client_id: string
          surveyor_id?: string | null
          status?: 'pending' | 'assigned' | 'submitted' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          client_id?: string
          surveyor_id?: string | null
          status?: 'pending' | 'assigned' | 'submitted' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      survey_responses: {
        Row: {
          id: string
          survey_id: string
          surveyor_id: string
          response_data: Json
          status: 'draft' | 'submitted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          surveyor_id: string
          response_data?: Json
          status?: 'draft' | 'submitted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          surveyor_id?: string
          response_data?: Json
          status?: 'draft' | 'submitted'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}