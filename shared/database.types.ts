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
      game_events: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          player_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          player_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          player_id?: string | null
          type?: string
        }
      }
      planets: {
        Row: {
          colonized_at: string | null
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          population: number | null
          size: number | null
          type: string | null
          x: number
          y: number
        }
        Insert: {
          colonized_at?: string | null
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          population?: number | null
          size?: number | null
          type?: string | null
          x: number
          y: number
        }
        Update: {
          colonized_at?: string | null
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          population?: number | null
          size?: number | null
          type?: string | null
          x?: number
          y?: number
        }
      }
      player_resources: {
        Row: {
          credits: number | null
          energy: number | null
          food: number | null
          id: string
          minerals: number | null
          player_id: string
          updated_at: string | null
        }
        Insert: {
          credits?: number | null
          energy?: number | null
          food?: number | null
          id?: string
          minerals?: number | null
          player_id: string
          updated_at?: string | null
        }
        Update: {
          credits?: number | null
          energy?: number | null
          food?: number | null
          id?: string
          minerals?: number | null
          player_id?: string
          updated_at?: string | null
        }
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          last_seen_at: string | null
          score: number | null
          total_credits: number | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          last_seen_at?: string | null
          score?: number | null
          total_credits?: number | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen_at?: string | null
          score?: number | null
          total_credits?: number | null
          username?: string
        }
      }
      trade_offers: {
        Row: {
          created_at: string | null
          from_player_id: string
          id: string
          offer_credits: number | null
          offer_energy: number | null
          offer_food: number | null
          offer_minerals: number | null
          request_credits: number | null
          request_energy: number | null
          request_food: number | null
          request_minerals: number | null
          status: string | null
          to_player_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_player_id: string
          id?: string
          offer_credits?: number | null
          offer_energy?: number | null
          offer_food?: number | null
          offer_minerals?: number | null
          request_credits?: number | null
          request_energy?: number | null
          request_food?: number | null
          request_minerals?: number | null
          status?: string | null
          to_player_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_player_id?: string
          id?: string
          offer_credits?: number | null
          offer_energy?: number | null
          offer_food?: number | null
          offer_minerals?: number | null
          request_credits?: number | null
          request_energy?: number | null
          request_food?: number | null
          request_minerals?: number | null
          status?: string | null
          to_player_id?: string
          updated_at?: string | null
        }
      }
    }
  }
}
