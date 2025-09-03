export interface UserProfile {
  id?: string
  firstName: string
  lastName: string
  phone?: string
  address: {
    street: string
    number: string
    postalCode: string
    municipality: string
    province?: string
    region: string
  }
  propertyType: string
  propertyOwnership: string
  renovationScale: string
  timeline: string
  budget?: string
  interests?: string[]
  preferredLanguage?: string
  onboardingCompleted: boolean
  onboardingStep: number
  userId?: string
}

export const useUserProfile = () => {
  const config = useRuntimeConfig()
  const strapiBaseUrl = config.public.strapiBaseUrl
  
  // Get current user profile
  const getUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No auth token found')
        return null
      }

      const response = await $fetch(`${strapiBaseUrl}/api/user-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        query: {
          'filters[user][id][$eq]': localStorage.getItem('user_id') || '',
          populate: '*'
        }
      })
      
      if (response.data && response.data.length > 0) {
        const profile = response.data[0]
        return transformStrapiProfile(profile)
      }
      
      return null
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return null
    }
  }
  
  // Save or update user profile
  const saveUserProfile = async (profileData: UserProfile): Promise<UserProfile> => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No auth token found')
      }
      
      const { currentUser } = useAuth()
      const userId = currentUser.value?.id
      
      if (!userId) {
        throw new Error('No user ID found')
      }
      
      // Check if profile exists
      const existingProfile = await getUserProfile()
      
      const strapiData = {
        ...profileData,
        user: userId
      }
      
      let response
      if (existingProfile?.id) {
        // Update existing profile
        response = await $fetch(`${strapiBaseUrl}/api/user-profiles/${existingProfile.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: {
            data: strapiData
          }
        })
      } else {
        // Create new profile
        response = await $fetch(`${strapiBaseUrl}/api/user-profiles`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: {
            data: strapiData
          }
        })
      }
      
      return transformStrapiProfile(response.data)
    } catch (error) {
      console.error('Failed to save user profile:', error)
      throw error
    }
  }
  
  // Check if user needs onboarding
  const needsOnboarding = async (): Promise<boolean> => {
    const profile = await getUserProfile()
    return !profile || !profile.onboardingCompleted
  }
  
  // Transform Strapi response to UserProfile
  const transformStrapiProfile = (strapiProfile: any): UserProfile => {
    return {
      id: strapiProfile.id || strapiProfile.documentId,
      firstName: strapiProfile.firstName,
      lastName: strapiProfile.lastName,
      phone: strapiProfile.phone,
      address: strapiProfile.address || {},
      propertyType: strapiProfile.propertyType,
      propertyOwnership: strapiProfile.propertyOwnership,
      renovationScale: strapiProfile.renovationScale,
      timeline: strapiProfile.timeline,
      budget: strapiProfile.budget,
      interests: strapiProfile.interests || [],
      preferredLanguage: strapiProfile.preferredLanguage || 'en',
      onboardingCompleted: strapiProfile.onboardingCompleted || false,
      onboardingStep: strapiProfile.onboardingStep || 1,
      userId: strapiProfile.user?.id || strapiProfile.user
    }
  }
  
  return {
    getUserProfile,
    saveUserProfile,
    needsOnboarding
  }
}