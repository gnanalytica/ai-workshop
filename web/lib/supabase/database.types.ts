export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: Database["public"]["Enums"]["announcement_audience"]
          body_md: string
          cohort_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          pinned_at: string | null
          title: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["announcement_audience"]
          body_md: string
          cohort_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          pinned_at?: string | null
          title: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["announcement_audience"]
          body_md?: string
          cohort_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          pinned_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          body_md: string | null
          cohort_id: string
          created_at: string
          day_number: number
          due_at: string | null
          id: string
          kind: Database["public"]["Enums"]["assignment_kind"]
          rubric_id: string | null
          title: string
        }
        Insert: {
          body_md?: string | null
          cohort_id: string
          created_at?: string
          day_number: number
          due_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["assignment_kind"]
          rubric_id?: string | null
          title: string
        }
        Update: {
          body_md?: string | null
          cohort_id?: string
          created_at?: string
          day_number?: number
          due_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["assignment_kind"]
          rubric_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: false
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "assignments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "assignments_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubric_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          cohort_id: string
          day_number: number
          marked_at: string
          marked_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Insert: {
          cohort_id: string
          day_number: number
          marked_at?: string
          marked_by?: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        Update: {
          cohort_id?: string
          day_number?: number
          marked_at?: string
          marked_by?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: false
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string | null
          body_md: string
          cohort_id: string
          created_at: string
          deleted_at: string | null
          id: string
          pinned_at: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_md: string
          cohort_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          pinned_at?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_md?: string
          cohort_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          pinned_at?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
        ]
      }
      community_replies: {
        Row: {
          author_id: string | null
          body_md: string
          created_at: string
          deleted_at: string | null
          id: string
          is_accepted: boolean
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_md: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_accepted?: boolean
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_md?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_accepted?: boolean
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          post_id: string | null
          reply_id: string | null
          user_id: string
          value: number
          voted_at: string
        }
        Insert: {
          post_id?: string | null
          reply_id?: string | null
          user_id: string
          value: number
          voted_at?: string
        }
        Update: {
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
          value?: number
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "community_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buddy_checkins: {
        Row: {
          body_md: string | null
          buddy_pair_id: string
          created_at: string
          day_number: number | null
          id: string
          kind: Database["public"]["Enums"]["buddy_checkin_kind"]
          user_id: string
        }
        Insert: {
          body_md?: string | null
          buddy_pair_id: string
          created_at?: string
          day_number?: number | null
          id?: string
          kind: Database["public"]["Enums"]["buddy_checkin_kind"]
          user_id: string
        }
        Update: {
          body_md?: string | null
          buddy_pair_id?: string
          created_at?: string
          day_number?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["buddy_checkin_kind"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buddy_checkins_buddy_pair_id_fkey"
            columns: ["buddy_pair_id"]
            isOneToOne: false
            referencedRelation: "buddy_pairs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buddy_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buddy_pairs: {
        Row: {
          cohort_id: string
          created_at: string
          id: string
          student_a: string
          student_b: string
          week_number: number
        }
        Insert: {
          cohort_id: string
          created_at?: string
          id?: string
          student_a: string
          student_b: string
          week_number: number
        }
        Update: {
          cohort_id?: string
          created_at?: string
          id?: string
          student_a?: string
          student_b?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "buddy_pairs_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buddy_pairs_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "buddy_pairs_student_a_fkey"
            columns: ["student_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buddy_pairs_student_b_fkey"
            columns: ["student_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      capstones: {
        Row: {
          cohort_id: string
          created_at: string
          deck_url: string | null
          demo_url: string | null
          id: string
          is_public: boolean
          owner_user_id: string
          phase: Database["public"]["Enums"]["capstone_phase"]
          problem_md: string | null
          repo_url: string | null
          solution_md: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          deck_url?: string | null
          demo_url?: string | null
          id?: string
          is_public?: boolean
          owner_user_id: string
          phase?: Database["public"]["Enums"]["capstone_phase"]
          problem_md?: string | null
          repo_url?: string | null
          solution_md?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          deck_url?: string | null
          demo_url?: string | null
          id?: string
          is_public?: boolean
          owner_user_id?: string
          phase?: Database["public"]["Enums"]["capstone_phase"]
          problem_md?: string | null
          repo_url?: string | null
          solution_md?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capstones_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstones_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "capstones_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_days: {
        Row: {
          capstone_kind: Database["public"]["Enums"]["day_capstone_kind"]
          cohort_id: string
          created_at: string
          day_number: number
          is_unlocked: boolean
          live_session_at: string | null
          meet_link: string | null
          notes: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capstone_kind?: Database["public"]["Enums"]["day_capstone_kind"]
          cohort_id: string
          created_at?: string
          day_number: number
          is_unlocked?: boolean
          live_session_at?: string | null
          meet_link?: string | null
          notes?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capstone_kind?: Database["public"]["Enums"]["day_capstone_kind"]
          cohort_id?: string
          created_at?: string
          day_number?: number
          is_unlocked?: boolean
          live_session_at?: string | null
          meet_link?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_days_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_days_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
        ]
      }
      cohort_faculty: {
        Row: {
          cohort_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_faculty_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_faculty_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "cohort_faculty_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          name: string
          slug: string
          starts_on: string
          status: Database["public"]["Enums"]["cohort_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          name: string
          slug: string
          starts_on: string
          status?: Database["public"]["Enums"]["cohort_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          name?: string
          slug?: string
          starts_on?: string
          status?: Database["public"]["Enums"]["cohort_status"]
          updated_at?: string
        }
        Relationships: []
      }
      day_comments: {
        Row: {
          body_md: string
          cohort_id: string
          created_at: string
          day_number: number
          deleted_at: string | null
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          body_md: string
          cohort_id: string
          created_at?: string
          day_number: number
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          body_md?: string
          cohort_id?: string
          created_at?: string
          day_number?: number
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "day_comments_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: false
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "day_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "day_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      day_faculty: {
        Row: {
          cohort_id: string
          day_number: number
          main_notes: string | null
          main_user_id: string | null
          shared_notes: string | null
          support_notes: string | null
          support_user_id: string | null
          updated_at: string
        }
        Insert: {
          cohort_id: string
          day_number: number
          main_notes?: string | null
          main_user_id?: string | null
          shared_notes?: string | null
          support_notes?: string | null
          support_user_id?: string | null
          updated_at?: string
        }
        Update: {
          cohort_id?: string
          day_number?: number
          main_notes?: string | null
          main_user_id?: string | null
          shared_notes?: string | null
          support_notes?: string | null
          support_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_faculty_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: true
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "day_faculty_main_user_id_fkey"
            columns: ["main_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_faculty_support_user_id_fkey"
            columns: ["support_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_pretraining_modules: {
        Row: {
          body_md: string | null
          created_at: string
          id: string
          ordinal: number
          slug: string
          title: string
        }
        Insert: {
          body_md?: string | null
          created_at?: string
          id?: string
          ordinal?: number
          slug: string
          title: string
        }
        Update: {
          body_md?: string | null
          created_at?: string
          id?: string
          ordinal?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      faculty_pretraining_progress: {
        Row: {
          cohort_id: string | null
          completed_at: string | null
          faculty_user_id: string
          module_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["pretraining_status"]
        }
        Insert: {
          cohort_id?: string | null
          completed_at?: string | null
          faculty_user_id: string
          module_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["pretraining_status"]
        }
        Update: {
          cohort_id?: string | null
          completed_at?: string | null
          faculty_user_id?: string
          module_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["pretraining_status"]
        }
        Relationships: [
          {
            foreignKeyName: "faculty_pretraining_progress_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_pretraining_progress_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "faculty_pretraining_progress_faculty_user_id_fkey"
            columns: ["faculty_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_pretraining_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "faculty_pretraining_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          cohort_id: string
          created_at: string
          day_number: number | null
          from_user_id: string
          id: string
          note: string
          to_user_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          day_number?: number | null
          from_user_id: string
          id?: string
          note: string
          to_user_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          day_number?: number | null
          from_user_id?: string
          id?: string
          note?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "kudos_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudos_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_progress: {
        Row: {
          cohort_id: string
          day_number: number
          lab_id: string
          status: Database["public"]["Enums"]["lab_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cohort_id: string
          day_number: number
          lab_id: string
          status?: Database["public"]["Enums"]["lab_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string
          day_number?: number
          lab_id?: string
          status?: Database["public"]["Enums"]["lab_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_progress_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: false
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "lab_progress_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_progress_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "lab_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          created_at: string
          email_to: string | null
          error: string | null
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          payload: Json
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_to?: string | null
          error?: string | null
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          payload?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_to?: string | null
          error?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          payload?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      peer_reviews: {
        Row: {
          body: string | null
          created_at: string
          reviewer_id: string
          score: number | null
          status: Database["public"]["Enums"]["peer_review_status"]
          submission_id: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          reviewer_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["peer_review_status"]
          submission_id: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          reviewer_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["peer_review_status"]
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      pod_events: {
        Row: {
          actor_user_id: string | null
          at: string
          id: string
          kind: Database["public"]["Enums"]["pod_event_kind"]
          payload: Json
          pod_id: string
        }
        Insert: {
          actor_user_id?: string | null
          at?: string
          id?: string
          kind: Database["public"]["Enums"]["pod_event_kind"]
          payload?: Json
          pod_id: string
        }
        Update: {
          actor_user_id?: string | null
          at?: string
          id?: string
          kind?: Database["public"]["Enums"]["pod_event_kind"]
          payload?: Json
          pod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_events_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_events_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "v_pod_summary"
            referencedColumns: ["pod_id"]
          },
        ]
      }
      pod_faculty: {
        Row: {
          added_at: string
          cohort_id: string
          faculty_user_id: string
          pod_id: string
        }
        Insert: {
          added_at?: string
          cohort_id?: string
          faculty_user_id: string
          pod_id: string
        }
        Update: {
          added_at?: string
          cohort_id?: string
          faculty_user_id?: string
          pod_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_faculty_faculty_user_id_fkey"
            columns: ["faculty_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_faculty_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_faculty_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "v_pod_summary"
            referencedColumns: ["pod_id"]
          },
        ]
      }
      pod_members: {
        Row: {
          added_at: string
          cohort_id: string
          pod_id: string
          student_user_id: string
        }
        Insert: {
          added_at?: string
          cohort_id: string
          pod_id: string
          student_user_id: string
        }
        Update: {
          added_at?: string
          cohort_id?: string
          pod_id?: string
          student_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "v_pod_summary"
            referencedColumns: ["pod_id"]
          },
          {
            foreignKeyName: "pod_members_student_user_id_fkey"
            columns: ["student_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pods: {
        Row: {
          cohort_id: string
          created_at: string
          id: string
          shared_notes: string | null
          name: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          id?: string
          shared_notes?: string | null
          name: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          id?: string
          shared_notes?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pods_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pods_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          choice: string
          poll_id: string
          user_id: string
          voted_at: string
        }
        Insert: {
          choice: string
          poll_id: string
          user_id: string
          voted_at?: string
        }
        Update: {
          choice?: string
          poll_id?: string
          user_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          closed_at: string | null
          cohort_id: string
          created_by: string | null
          day_number: number | null
          id: string
          opened_at: string
          options: Json
          question: string
        }
        Insert: {
          closed_at?: string | null
          cohort_id: string
          created_by?: string | null
          day_number?: number | null
          id?: string
          opened_at?: string
          options: Json
          question: string
        }
        Update: {
          closed_at?: string | null
          cohort_id?: string
          created_by?: string | null
          day_number?: number | null
          id?: string
          opened_at?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: false
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "polls_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          college: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          staff_roles: string[]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          staff_roles?: string[]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          staff_roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          max_uses: number | null
          organization_id: string | null
          uses: number
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          max_uses?: number | null
          organization_id?: string | null
          uses?: number
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          max_uses?: number | null
          organization_id?: string | null
          uses?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          id: string
          quiz_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          id?: string
          quiz_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          answer: Json
          kind: Database["public"]["Enums"]["quiz_question_kind"]
          options: Json
          ordinal: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          answer: Json
          kind: Database["public"]["Enums"]["quiz_question_kind"]
          options?: Json
          ordinal: number
          prompt: string
          quiz_id: string
        }
        Update: {
          answer?: Json
          kind?: Database["public"]["Enums"]["quiz_question_kind"]
          options?: Json
          ordinal?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          cohort_id: string
          created_at: string
          day_number: number
          id: string
          title: string
          version: number
        }
        Insert: {
          cohort_id: string
          created_at?: string
          day_number: number
          id?: string
          title: string
          version?: number
        }
        Update: {
          cohort_id?: string
          created_at?: string
          day_number?: number
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_cohort_id_day_number_fkey"
            columns: ["cohort_id", "day_number"]
            isOneToOne: false
            referencedRelation: "cohort_days"
            referencedColumns: ["cohort_id", "day_number"]
          },
          {
            foreignKeyName: "quizzes_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
        ]
      }
      rbac_events: {
        Row: {
          at: string
          cap: string
          ctx: Json
          granted: boolean
          id: number
          user_id: string | null
        }
        Insert: {
          at?: string
          cap: string
          ctx?: Json
          granted: boolean
          id?: number
          user_id?: string | null
        }
        Update: {
          at?: string
          cap?: string
          ctx?: Json
          granted?: boolean
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rbac_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          cohort_id: string
          created_at: string
          promo_code: string | null
          source: string | null
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          promo_code?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          promo_code?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "registrations_promo_code_fkey"
            columns: ["promo_code"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_templates: {
        Row: {
          created_at: string
          criteria: Json
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_desk_queue: {
        Row: {
          claimed_by: string | null
          cohort_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["help_desk_kind"]
          message: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["help_desk_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_by?: string | null
          cohort_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["help_desk_kind"]
          message?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["help_desk_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_by?: string | null
          cohort_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["help_desk_kind"]
          message?: string | null
          resolution?: string | null
          status?: Database["public"]["Enums"]["help_desk_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_desk_queue_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_desk_queue_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_desk_queue_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "help_desk_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          attachments: Json
          body: string | null
          created_at: string
          feedback_md: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          attachments?: Json
          body?: string | null
          created_at?: string
          feedback_md?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          attachments?: Json
          body?: string | null
          created_at?: string
          feedback_md?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          joined_at: string
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          cohort_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_cohort_summary: {
        Row: {
          cohort_id: string | null
          confirmed_students: number | null
          ends_on: string | null
          faculty_count: number | null
          name: string | null
          pending_students: number | null
          pod_count: number | null
          starts_on: string | null
          status: Database["public"]["Enums"]["cohort_status"] | null
        }
        Insert: {
          cohort_id?: string | null
          confirmed_students?: never
          ends_on?: string | null
          faculty_count?: never
          name?: string | null
          pending_students?: never
          pod_count?: never
          starts_on?: string | null
          status?: Database["public"]["Enums"]["cohort_status"] | null
        }
        Update: {
          cohort_id?: string | null
          confirmed_students?: never
          ends_on?: string | null
          faculty_count?: never
          name?: string | null
          pending_students?: never
          pod_count?: never
          starts_on?: string | null
          status?: Database["public"]["Enums"]["cohort_status"] | null
        }
        Relationships: []
      }
      v_pod_summary: {
        Row: {
          cohort_id: string | null
          faculty_count: number | null
          member_count: number | null
          name: string | null
          pod_id: string | null
          primary_faculty_id: string | null
        }
        Insert: {
          cohort_id?: string | null
          faculty_count?: never
          member_count?: never
          name?: string | null
          pod_id?: string | null
          primary_faculty_id?: never
        }
        Update: {
          cohort_id?: string | null
          faculty_count?: never
          member_count?: never
          name?: string | null
          pod_id?: string | null
          primary_faculty_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "pods_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pods_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
        ]
      }
      v_help_desk_open: {
        Row: {
          claimed_by_name: string | null
          cohort_id: string | null
          created_at: string | null
          id: string | null
          kind: Database["public"]["Enums"]["help_desk_kind"] | null
          message: string | null
          status: Database["public"]["Enums"]["help_desk_status"] | null
          student_email: string | null
          student_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_desk_queue_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_desk_queue_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
        ]
      }
      v_student_progress: {
        Row: {
          cohort_id: string | null
          days_present: number | null
          email: string | null
          full_name: string | null
          graded_subs: number | null
          labs_done: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "v_cohort_summary"
            referencedColumns: ["cohort_id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_caps: { Args: { p_cohort?: string }; Returns: string[] }
      can_grade: { Args: { p_submission: string }; Returns: boolean }
      current_user_id: { Args: never; Returns: string }
      faculty_cohort_ids: { Args: never; Returns: string[] }
      has_cap: { Args: { p_cap: string; p_cohort?: string }; Returns: boolean }
      has_staff_role: { Args: { role: string }; Returns: boolean }
      is_enrolled_in: { Args: { p_cohort: string }; Returns: boolean }
      rpc_claim_help_desk_ticket: {
        Args: { p_id: string }
        Returns: {
          claimed_by: string | null
          cohort_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["help_desk_kind"]
          message: string | null
          resolution: string | null
          status: Database["public"]["Enums"]["help_desk_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "help_desk_queue"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_generate_buddy_pairs: {
        Args: { p_cohort: string; p_week: number }
        Returns: number
      }
      rpc_give_kudos: {
        Args: {
          p_cohort: string
          p_day?: number
          p_note: string
          p_to_user: string
        }
        Returns: {
          cohort_id: string
          created_at: string
          day_number: number | null
          from_user_id: string
          id: string
          note: string
          to_user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "kudos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_grade_submission: {
        Args: { p_feedback?: string; p_score: number; p_submission: string }
        Returns: {
          assignment_id: string
          attachments: Json
          body: string | null
          created_at: string
          feedback_md: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "submissions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_mark_attendance: {
        Args: {
          p_cohort: string
          p_day: number
          p_status: Database["public"]["Enums"]["attendance_status"]
          p_user: string
        }
        Returns: {
          cohort_id: string
          day_number: number
          marked_at: string
          marked_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_my_pod: {
        Args: { p_cohort: string }
        Returns: {
          faculty: Json
          shared_notes: string
          pod_id: string
          pod_name: string
        }[]
      }
      rpc_pod_faculty_event: {
        Args: {
          p_kind: Database["public"]["Enums"]["pod_event_kind"]
          p_payload?: Json
          p_pod_id: string
          p_target_id: string
          p_to_user_id?: string
        }
        Returns: {
          actor_user_id: string | null
          at: string
          id: string
          kind: Database["public"]["Enums"]["pod_event_kind"]
          payload: Json
          pod_id: string
        }
        SetofOptions: {
          from: "*"
          to: "pod_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_self_check_in: {
        Args: { p_cohort: string; p_day: number }
        Returns: {
          cohort_id: string
          day_number: number
          marked_at: string
          marked_by: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "attendance"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      seed_curriculum_for: { Args: { p_cohort: string }; Returns: undefined }
      shares_pod_with: {
        Args: { p_cohort: string; p_student: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_audience: "all" | "students" | "faculty" | "staff"
      assignment_kind: "lab" | "capstone" | "reflection" | "quiz"
      attendance_status: "present" | "absent" | "late" | "excused"
      buddy_checkin_kind: "day_open" | "day_close" | "weekly"
      capstone_phase: "idea" | "spec" | "mid" | "demo" | "shipped"
      cohort_status: "draft" | "live" | "archived"
      day_capstone_kind: "none" | "spec_review" | "mid_review" | "demo_day"
      lab_status: "not_started" | "in_progress" | "done"
      notification_kind:
        | "daily_digest"
        | "registration_status"
        | "announcement"
        | "grade_returned"
      notification_status: "queued" | "sent" | "failed"
      peer_review_status: "assigned" | "completed" | "skipped"
      pod_event_kind:
        | "member_added"
        | "member_removed"
        | "faculty_added"
        | "faculty_removed"
        | "primary_changed"
        | "handoff"
      pretraining_status: "not_started" | "in_progress" | "completed"
      quiz_question_kind: "single" | "multi" | "short"
      registration_status: "pending" | "confirmed" | "waitlist" | "cancelled"
      help_desk_kind: "content" | "tech" | "team" | "other"
      help_desk_status: "open" | "helping" | "resolved" | "cancelled"
      submission_status: "draft" | "submitted" | "graded" | "returned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_audience: ["all", "students", "faculty", "staff"],
      assignment_kind: ["lab", "capstone", "reflection", "quiz"],
      attendance_status: ["present", "absent", "late", "excused"],
      buddy_checkin_kind: ["day_open", "day_close", "weekly"],
      capstone_phase: ["idea", "spec", "mid", "demo", "shipped"],
      cohort_status: ["draft", "live", "archived"],
      day_capstone_kind: ["none", "spec_review", "mid_review", "demo_day"],
      lab_status: ["not_started", "in_progress", "done"],
      notification_kind: [
        "daily_digest",
        "registration_status",
        "announcement",
        "grade_returned",
      ],
      notification_status: ["queued", "sent", "failed"],
      peer_review_status: ["assigned", "completed", "skipped"],
      pod_event_kind: [
        "member_added",
        "member_removed",
        "faculty_added",
        "faculty_removed",
        "primary_changed",
        "handoff",
      ],
      pretraining_status: ["not_started", "in_progress", "completed"],
      quiz_question_kind: ["single", "multi", "short"],
      registration_status: ["pending", "confirmed", "waitlist", "cancelled"],
      help_desk_kind: ["content", "tech", "team", "other"],
      help_desk_status: ["open", "helping", "resolved", "cancelled"],
      submission_status: ["draft", "submitted", "graded", "returned"],
    },
  },
} as const
