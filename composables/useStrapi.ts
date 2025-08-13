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
    color: strapiFloor.Color || '#efefef',
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

// Reverse transformation: Convert frontend Project to Strapi format
const transformProjectToStrapi = (project: Project): any => {
  // For now, only update the simple fields that don't involve complex relations
  // TODO: Handle building/floor relations properly in future iteration
  
  return {
    ProjectName: project.name,
    GeneralAttributes: project.generalAttributes
    // NOTE: Building relations are complex - leaving them out for now
    // This means we can only update project name and general attributes
  }
}

// Reverse transformation: Convert frontend Floor to Strapi format
const transformFloorToStrapi = (floor: Floor): any => {
  return {
    Storey: floor.storey,
    Dimensions: {
      height: floor.height
    },
    HeightPosition: floor.heightPosition,
    Color: floor.color,
    Windows: transformWindowsOrDoorsToStrapi(floor.windows || {}),
    Doors: transformWindowsOrDoorsToStrapi(floor.doors || {})
  }
}

// Reverse transformation: Convert frontend windows/doors to Strapi format
const transformWindowsOrDoorsToStrapi = (items: Record<string, WindowOrDoor>): any[] => {
  return Object.values(items).map(item => ({
    Dimensions: {
      width: item.width,
      height: item.height,
      position: {
        orientation: item.position.orientation,
        x: item.position.x,
        y: item.position.y
      }
    }
  }))
}

// Reverse transformation: Convert frontend Roof to Strapi format
const transformRoofToStrapi = (roof: Roof): any => {
  return {
    Type: roof.type,
    Dimensions: {
      width: roof.width,
      depth: roof.depth,
      height: roof.height,
      heightPosition: roof.heightPosition
    }
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
    try {
      const strapiData = transformProjectToStrapi(project)
      
      // Determine if this is a new project or update
      const isNewProject = !project.id || project.id.startsWith('mock-')
      
      if (isNewProject) {
        // Create new project - Strapi v5 requires data wrapper
        const response = await client<{data: any}>('/api/projects', {
          method: 'POST',
          body: { data: strapiData }
        })
        return transformProject(response.data)
      } else {
        // Update existing project - Strapi v5 requires data wrapper
        const response = await client<{data: any}>(`/api/projects/${project.id}`, {
          method: 'PUT',
          body: { data: strapiData }
        })
        return transformProject(response.data)
      }
    } catch (error) {
      console.error('Failed to save project to Strapi:', error)
      throw new Error('Failed to save project')
    }
  }

  const updateProject = async (project: Project): Promise<Project> => {
    try {
      if (!project.id || project.id.startsWith('mock-')) {
        throw new Error('Cannot update project: Invalid project ID')
      }

      const strapiData = transformProjectToStrapi(project)
      
      const response = await client<{data: any}>(`/api/projects/${project.id}`, {
        method: 'PUT',
        body: { data: strapiData }
      })
      
      return transformProject(response.data)
    } catch (error) {
      console.error('Failed to update project in Strapi:', error)
      throw new Error('Failed to update project')
    }
  }

  const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      const strapiData = transformProjectToStrapi(project as Project)
      
      const response = await client<{data: any}>('/api/projects', {
        method: 'POST',
        body: { data: strapiData }
      })
      
      return transformProject(response.data)
    } catch (error) {
      console.error('Failed to create project in Strapi:', error)
      throw new Error('Failed to create project')
    }
  }

  return {
    client,
    loadProject,
    loadUserProjects,
    saveProject,
    updateProject,
    createProject,
    transformProject, // Export for testing
    transformProjectToStrapi // Export for testing
  }
}