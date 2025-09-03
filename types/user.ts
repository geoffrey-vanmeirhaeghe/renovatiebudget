export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  phone?: string
  userPhase?: 'onboarding' | 'project-setup' | 'onboarded'
  createdAt: Date
  updatedAt: Date
  avatar?: string
  preferences?: UserPreferences
}

export interface BelgianAddress {
  street: string
  number: string
  postalCode: string
  municipality: string
  province: string
  region: 'flanders' | 'brussels' | 'wallonia'
  coordinates?: {
    lat: number
    lng: number
  }
}

export type PropertyType = 'house' | 'apartment' | 'commercial'
export type RenovationScale = 'room' | 'floor' | 'house'
export type Timeline = 'immediate' | 'this-year' | 'next-year' | 'planning'

export interface UserPreferences {
  language: 'en' | 'nl' | 'fr'
  units: 'metric' | 'imperial'
  emailNotifications: boolean
  marketingEmails: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface UserProfile extends User {
  bio?: string
  company?: string
  website?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
}

// Authentication related types
export interface AuthToken {
  token: string
  refreshToken: string
  expiresAt: Date
}

export interface LoginResponse {
  user: User
  token: AuthToken
}

export interface RegisterResponse extends LoginResponse {
  emailVerificationRequired: boolean
}