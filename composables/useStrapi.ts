import type { Project, Floor, WindowOrDoor, Roof } from '~/types/project'

interface StrapiConfig {
  baseURL: string
  apiToken?: string
}

// Transform Strapi Floor data to frontend format
const transformFloor = (strapiFloor: any): Floor => {
  
  // Add some default windows and doors since they're not in Strapi yet
  const defaultWindows = strapiFloor.Windows || [
    {
      Dimensions: {
        width: 90,
        height: 210,
        position: { orientation: 'front', x: 120, y: 0 }
      }
    },
    {
      Dimensions: {
        width: 120,
        height: 210,
        position: { orientation: 'front', x: 500, y: 0 }
      }
    },
    {
      Dimensions: {
        width: 90,
        height: 210,
        position: { orientation: 'back', x: 300, y: 0 }
      }
    }
  ]
  
  const defaultDoors = strapiFloor.Doors || [
    {
      Dimensions: {
        width: 90,
        height: 210,
        position: { orientation: 'front', x: 800, y: 0 }
      }
    }
  ]
  
  return {
    storey: strapiFloor.Storey,
    height: strapiFloor.Dimensions?.height || 250,
    heightPosition: strapiFloor.HeightPosition || (strapiFloor.Storey * 250),
    color: strapiFloor.Color || '#efef',
    windows: transformWindowsOrDoors(defaultWindows),
    doors: transformWindowsOrDoors(defaultDoors)
  }
}

// Transform Strapi Windows/Doors to frontend format
const transformWindowsOrDoors = (items: any[]): Record<string, WindowOrDoor> => {
  const result: Record<string, WindowOrDoor> = {}
  
  items.forEach((item, index) => {
    const dimensions = item.Dimensions
    result[String(index + 1)] = {
      width: dimensions?.width || 90,
      height: dimensions?.height || 210,
      position: {
        orientation: dimensions?.position?.orientation || 'front',
        x: dimensions?.position?.x || 0,
        y: dimensions?.position?.y || 0
      }
    }
  })
  
  return result
}

// Transform Strapi Roof to frontend format  
const transformRoof = (strapiRoof: any): Roof => {
  const dimensions = strapiRoof?.Dimensions || {}
  
  return {
    type: (strapiRoof?.Type?.toLowerCase() || 'gable') as Roof['type'],
    width: dimensions.width || 1150,
    depth: dimensions.depth || 800,
    height: dimensions.height || 250,
    heightPosition: dimensions.heightPosition || 500
  }
}

// Transform complete Strapi project to frontend format
const transformProject = (strapiProject: any): Project => {
  // Strapi v5 direct data structure (no nested attributes)
  const building = strapiProject.building
  
  // Transform floors from the building relation
  const floors: Record<string, Floor> = {}
  if (building?.floor) {
    floors['0'] = transformFloor(building.floor)
  }
  
  const transformedProject = {
    id: strapiProject.documentId, // Use documentId for frontend
    name: strapiProject.ProjectName,
    generalAttributes: strapiProject.GeneralAttributes || {
      propertySize: { width: 2000, depth: 2000 },
      floorSize: { width: 1150, depth: 1050 }
    },
    floors,
    roof: building?.Roof?.[0] ? transformRoof(building.Roof[0]) : undefined
  }

  // Fix roof height position to sit on top of the actual floors
  if (transformedProject.roof && Object.keys(floors).length > 0) {
    const highestFloor = Object.values(floors).reduce((max, floor) => 
      Math.max(max, floor.heightPosition + floor.height), 0)
    transformedProject.roof.heightPosition = highestFloor
  }

  return transformedProject
}

export const useStrapi = () => {
  const config = useRuntimeConfig()
  
  const strapiBaseURL = config.public.strapi?.baseURL || 'http://localhost:1337'
  
  const client = $fetch.create({
    baseURL: strapiBaseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const loadProject = async (projectId: string): Promise<Project> => {
    try {
      // Use the working populate syntax from our tests
      const response = await client<{data: any}>(`/api/projects/${projectId}?populate[building][populate][floor]=true&populate[building][populate][Roof]=true`)
      
      return transformProject(response.data)
    } catch (error) {
      console.error('Failed to load project from Strapi:', error)
      throw new Error('Failed to load project')
    }
  }

  const loadUserProjects = async (): Promise<Project[]> => {
    try {
      // Use the working populate syntax from our tests  
      const response = await client<{data: any[]}>('/api/projects?populate[building][populate][floor]=true&populate[building][populate][Roof]=true')
      
      return response.data.map(transformProject)
    } catch (error) {
      console.error('Failed to load projects from Strapi:', error)
      throw new Error('Failed to load projects')
    }
  }

  const saveProject = async (project: Project): Promise<Project> => {
    // TODO: Implement reverse transformation and PUT/POST to Strapi
    throw new Error('Save project not yet implemented')
  }

  return {
    client,
    loadProject,
    loadUserProjects,
    saveProject,
    transformProject // Export for testing
  }
}