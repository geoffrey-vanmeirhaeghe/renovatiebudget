import type { Project, Floor, WindowOrDoor, Roof } from '~/types/project'

interface StrapiConfig {
  baseURL: string
  apiToken?: string
}

// Transform Strapi Floor data to frontend format
const transformFloor = (strapiFloor: any): Floor => {
  
  // Windows and doors are now properly populated from Strapi
  const windowsData = strapiFloor.Windows || []
  const doorsData = strapiFloor.Doors || []
  const dimensions = strapiFloor.Dimensions || {}
  
  return {
    storey: strapiFloor.Storey,
    height: dimensions.height || 250,
    heightPosition: strapiFloor.HeightPosition || (strapiFloor.Storey * 250),
    color: strapiFloor.Color || '#efefef',
    ...(dimensions.width !== undefined && { width: dimensions.width }),
    ...(dimensions.depth !== undefined && { depth: dimensions.depth }),
    ...(strapiFloor.positionX !== undefined && { positionX: strapiFloor.positionX }),
    ...(strapiFloor.positionZ !== undefined && { positionZ: strapiFloor.positionZ }),
    windows: transformWindowsOrDoors(windowsData),
    doors: transformWindowsOrDoors(doorsData)
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
  
  // Convert Strapi roof types back to frontend format
  const convertRoofType = (strapiType: string): Roof['type'] => {
    const typeMap: Record<string, Roof['type']> = {
      'Gable': 'gable',
      'Hip': 'hip', 
      'Flat': 'flat',
      'Shed': 'shed',
      'Butterfly': 'gable', // Map unsupported types to gable
      'Gambrel': 'gable',
      'Mansard': 'gable',
      'M Shaped': 'gable',
      'Pyramid': 'hip'
    }
    return typeMap[strapiType] || 'gable' // Default to gable
  }
  
  return {
    type: convertRoofType(strapiRoof?.Type || 'Gable'),
    width: dimensions.width || 1150,
    depth: dimensions.depth || 800,
    height: dimensions.height || 250,
    heightPosition: dimensions.heightPosition || 500,
    ...(dimensions.positionX !== undefined && { positionX: dimensions.positionX }),
    ...(dimensions.positionZ !== undefined && { positionZ: dimensions.positionZ })
  }
}

// Reverse transformation: Convert frontend Project to Strapi format
const transformProjectToStrapi = (project: Project): any => {
  // Transform all floors (now supports multiple floors)
  const floorsArray = Object.values(project.floors).map(floor => transformFloorToStrapi(floor))
  
  const building = {
    Description: `Building for project: ${project.name || 'Unnamed Project'}`, // Required field
    floors: floorsArray,
    Roof: project.roof ? [transformRoofToStrapi(project.roof)] : []
  }
  
  return {
    ProjectName: project.name,
    GeneralAttributes: project.generalAttributes,
    building: building
  }
}

// Reverse transformation: Convert frontend Floor to Strapi format
const transformFloorToStrapi = (floor: Floor): any => {
  // Generate descriptive name based on floor number
  const getFloorDescription = (storey: number): string => {
    if (storey === 0) return 'Ground Floor'
    if (storey === 1) return 'First Floor' 
    if (storey === 2) return 'Second Floor'
    if (storey === 3) return 'Third Floor'
    return `Floor ${storey}`
  }

  return {
    Storey: floor.storey,
    Description: getFloorDescription(floor.storey), // Required field
    Dimensions: {
      height: floor.height,
      ...(floor.width !== undefined && { width: floor.width }),
      ...(floor.depth !== undefined && { depth: floor.depth })
    },
    ...(floor.positionX !== undefined && { positionX: floor.positionX }),
    ...(floor.positionZ !== undefined && { positionZ: floor.positionZ }),
    HeightPosition: floor.heightPosition,
    Color: floor.color,
    Windows: transformWindowsOrDoorsToStrapi(floor.windows || {}, 'windows'),
    Doors: transformWindowsOrDoorsToStrapi(floor.doors || {}, 'doors')
  }
}

// Reverse transformation: Convert frontend windows/doors to Strapi format
const transformWindowsOrDoorsToStrapi = (items: Record<string, WindowOrDoor>, itemType: 'windows' | 'doors' = 'windows'): any[] => {
  const typeLabel = itemType === 'windows' ? 'Window' : 'Door'
  return Object.values(items).map((item, index) => ({
    Description: `${typeLabel} ${index + 1}`, // Required field  
    Type: 'Single', // Default type
    Style: 'Modern', // Default style
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
  // Capitalize the roof type to match Strapi enum values
  const capitalizeRoofType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'gable': 'Gable',
      'hip': 'Hip',
      'flat': 'Flat',
      'shed': 'Shed'
    }
    return typeMap[type] || 'Gable' // Default to Gable if unknown
  }
  
  return {
    Type: capitalizeRoofType(roof.type),
    Storey: 1, // Default roof storey
    Description: `${capitalizeRoofType(roof.type)} roof for building`,
    Dimensions: {
      width: roof.width,
      depth: roof.depth,
      height: roof.height,
      heightPosition: roof.heightPosition,
      ...(roof.positionX !== undefined && { positionX: roof.positionX }),
      ...(roof.positionZ !== undefined && { positionZ: roof.positionZ })
    }
  }
}

// Transform complete Strapi project to frontend format
const transformProject = (strapiProject: any): Project => {
  // Strapi v5 direct data structure (no nested attributes)
  const building = strapiProject.building
  
  // Transform floors from the building relation (now supports multiple floors)
  const floors: Record<string, Floor> = {}
  if (building?.floors && Array.isArray(building.floors)) {
    building.floors.forEach((strapiFloor: any) => {
      floors[strapiFloor.Storey.toString()] = transformFloor(strapiFloor)
    })
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

// Enhanced error logging utility
const logApiError = (operation: string, error: any, context?: any) => {
  console.group(`❌ [Strapi API Error] ${operation}`)
  
  // Log the basic error
  console.error('Error details:', {
    message: error?.message || 'Unknown error',
    statusCode: error?.statusCode || error?.status || 'No status',
    statusText: error?.statusText || 'No status text',
    url: error?.url || context?.url || 'No URL',
    method: error?.method || context?.method || 'Unknown method'
  })
  
  // Log response data if available
  if (error?.data) {
    console.error('Response data:', error.data)
  }
  
  // Log request context if available
  if (context) {
    console.error('Request context:', context)
  }
  
  // Log full error object for debugging
  console.error('Full error object:', error)
  
  console.groupEnd()
}

// API endpoint testing utilities
const testApiEndpoint = async (client: any, endpoint: string, method = 'GET', data?: any) => {
  console.log(`🧪 Testing endpoint: ${method} ${endpoint}`)
  
  try {
    const response = await client(endpoint, {
      method,
      ...(data && { body: data })
    })
    
    console.log(`✅ ${endpoint} - Success:`, {
      status: 'OK',
      hasData: !!response?.data,
      dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
      itemCount: Array.isArray(response?.data) ? response.data.length : 'N/A'
    })
    
    return { success: true, response, error: null }
  } catch (error: any) {
    console.log(`❌ ${endpoint} - Failed:`, {
      status: error?.statusCode || error?.status || 'Unknown',
      message: error?.message || 'Unknown error',
      hasData: !!error?.data
    })
    
    return { success: false, response: null, error }
  }
}

export const useStrapi = () => {
  const config = useRuntimeConfig()
  
  const strapiBaseURL = config.public.strapi?.baseURL || 'http://localhost:1337'
  
  console.log('🔧 Initializing Strapi client with base URL:', strapiBaseURL)
  
  const client = $fetch.create({
    baseURL: strapiBaseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    // Add timeout and retry configuration
    timeout: 30000, // 30 seconds
    retry: 1,
    onRequest({ request, options }) {
      console.log('🌐 API Request:', {
        method: options.method || 'GET',
        url: request,
        hasBody: !!options.body
      })
    },
    onResponse({ response }) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.url,
        hasData: !!response._data
      })
    },
    onResponseError({ request, response, error }) {
      console.error('❌ API Response Error:', {
        method: response.request?.method || 'Unknown',
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        error: error?.message
      })
    }
  })

  const loadProject = async (projectId: string): Promise<Project> => {
    const operation = `Load Project (${projectId})`
    console.log(`📖 ${operation} - Starting...`)
    
    try {
      // Use the working populate syntax from our tests with deep nesting for Windows/Doors
      const endpoint = `/api/projects/${projectId}?populate[building][populate][floors][populate][Windows]=true&populate[building][populate][floors][populate][Doors]=true&populate[building][populate][Roof]=true`
      const response = await client<{data: any}>(endpoint)
      
      console.log(`✅ ${operation} - Success:`, {
        hasProject: !!response.data,
        projectName: response.data?.ProjectName,
        hasBuilding: !!response.data?.building,
        buildingId: response.data?.building?.documentId
      })
      
      return transformProject(response.data)
    } catch (error) {
      logApiError(operation, error, { projectId })
      throw new Error(`Failed to load project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const loadUserProjects = async (): Promise<Project[]> => {
    const operation = 'Load User Projects'
    console.log(`📋 ${operation} - Starting...`)
    
    try {
      // Use the working populate syntax from our tests with deep nesting for Windows/Doors
      const endpoint = '/api/projects?populate[building][populate][floors][populate][Windows]=true&populate[building][populate][floors][populate][Doors]=true&populate[building][populate][Roof]=true'
      const response = await client<{data: any[]}>(endpoint)
      
      console.log(`✅ ${operation} - Success:`, {
        projectCount: response.data?.length || 0,
        projects: response.data?.map(p => ({
          id: p.documentId,
          name: p.ProjectName,
          hasBuilding: !!p.building
        })) || []
      })
      
      return response.data.map(transformProject)
    } catch (error) {
      logApiError(operation, error)
      throw new Error(`Failed to load projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const saveProject = async (project: Project): Promise<Project> => {
    const operation = `Save Project (${project.name || 'Unnamed'})`
    const isNewProject = !project.id || project.id.startsWith('mock-')
    
    console.log(`💾 ${operation} - Starting...`, {
      isNewProject,
      projectId: project.id,
      hasFloors: Object.keys(project.floors).length,
      hasRoof: !!project.roof
    })
    
    try {
      if (isNewProject) {
        console.log('📝 Creating new project with relations')
        return await createProjectWithRelations(project)
      } else {
        console.log('🔄 Updating existing project with relations')
        return await updateProjectWithRelations(project)
      }
    } catch (error) {
      logApiError(operation, error, { 
        projectId: project.id, 
        projectName: project.name,
        isNewProject,
        floorCount: Object.keys(project.floors).length
      })
      throw new Error(`Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateProject = async (project: Project): Promise<Project> => {
    try {
      if (!project.id || project.id.startsWith('mock-')) {
        throw new Error('Cannot update project: Invalid project ID')
      }

      // Use the same two-phase strategy as saveProject
      return await updateProjectWithRelations(project)
    } catch (error) {
      console.error('Failed to update project in Strapi:', error)
      throw new Error('Failed to update project')
    }
  }

  const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      // Use the new relation-aware creation strategy
      return await createProjectWithRelations(project)
    } catch (error) {
      console.error('Failed to create project in Strapi:', error)
      throw new Error('Failed to create project')
    }
  }

  // Two-phase save strategy for Strapi v5 relations
  const createProjectWithRelations = async (project: Omit<Project, 'id'>): Promise<Project> => {
    // Phase 1: Create project with basic data only
    const basicProjectData = {
      ProjectID: `PRJ-${Date.now()}`, // Required field
      ProjectName: project.name,
      Scope: 'New construction', // Required field - default value
      ProjectStatus: 'Starting up', // Required field - default value
      GeneralAttributes: project.generalAttributes
    }
    
    const projectResponse = await client<{data: any}>('/api/projects', {
      method: 'POST',
      body: { data: basicProjectData }
    })
    
    const createdProject = projectResponse.data
    
    // Phase 2: Create building with relations
    await saveBuildingRelations(createdProject.documentId, project)
    
    // Phase 3: Load complete project with relations
    return await loadProject(createdProject.documentId)
  }
  
  const updateProjectWithRelations = async (project: Project): Promise<Project> => {
    // Phase 1: Update basic project data - only update the fields we manage
    const basicProjectData = {
      ProjectName: project.name,
      GeneralAttributes: project.generalAttributes
      // Don't update ProjectID, Scope, and ProjectStatus on updates to preserve existing values
    }
    
    await client<{data: any}>(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: { data: basicProjectData }
    })
    
    // Phase 2: Update building relations
    await saveBuildingRelations(project.id, project)
    
    // Phase 3: Load complete project with relations
    console.log('🔄 Final step: Reloading complete project with relations...')
    const reloadedProject = await loadProject(project.id)
    console.log('🔍 Final reloaded project:', {
      id: reloadedProject.id,
      name: reloadedProject.name,
      hasFloors: Object.keys(reloadedProject.floors).length,
      hasRoof: !!reloadedProject.roof,
      floorDetails: Object.entries(reloadedProject.floors).map(([key, floor]) => ({
        key,
        storey: floor.storey,
        height: floor.height,
        heightPosition: floor.heightPosition,
        color: floor.color,
        windowCount: Object.keys(floor.windows || {}).length,
        doorCount: Object.keys(floor.doors || {}).length
      })),
      roofDetails: reloadedProject.roof ? {
        type: reloadedProject.roof.type,
        width: reloadedProject.roof.width,
        height: reloadedProject.roof.height,
        heightPosition: reloadedProject.roof.heightPosition
      } : null
    })
    return reloadedProject
  }
  
  // Helper function to update floor with Windows/Doors relations
  const updateFloorWithRelations = async (buildingId: string, floorData: any): Promise<void> => {
    console.log('🏠 Updating floor with Windows/Doors relations...')
    
    // Get the current floor ID for this building
    const buildingResponse = await client<{data: any}>(`/api/buildings/${buildingId}?populate[floor]=true`)
    const floorId = buildingResponse.data.floor?.documentId
    
    if (!floorId) {
      console.error('❌ No floor found for building:', buildingId)
      return
    }
    
    console.log('🔍 Found floor ID:', floorId)
    
    // Update floor with complete data including Windows/Doors
    const completeFloorData = {
      Storey: floorData.Storey,
      Dimensions: floorData.Dimensions,
      HeightPosition: floorData.HeightPosition,
      Color: floorData.Color,
      Windows: floorData.Windows || [],
      Doors: floorData.Doors || []
    }
    
    console.log('🔍 Complete floor data to update:', JSON.stringify(completeFloorData, null, 2))
    
    await client<{data: any}>(`/api/floors/${floorId}`, {
      method: 'PUT',
      body: { data: completeFloorData }
    })
    
    console.log('✅ Floor updated with complete Windows/Doors data')
  }
  
  // Helper function to update Windows for a floor
  const updateWindowsForFloor = async (floorId: string, windowsData: any[]): Promise<void> => {
    console.log('🪟 Updating Windows for floor:', floorId)
    
    // Get existing windows
    const floorResponse = await client<{data: any}>(`/api/floors/${floorId}?populate[Windows]=true`)
    const existingWindows = floorResponse.data.Windows || []
    
    console.log('🔍 Existing windows structure:', JSON.stringify(existingWindows, null, 2))
    
    // Update each window by index
    for (let i = 0; i < windowsData.length; i++) {
      const windowData = windowsData[i]
      
      if (existingWindows[i]) {
        // Check for different possible ID properties
        const windowId = existingWindows[i].documentId || existingWindows[i].id || existingWindows[i].Id
        console.log(`🔍 Window ${i + 1} ID:`, windowId, 'from object:', existingWindows[i])
        
        if (windowId) {
          await client(`/api/windows/${windowId}`, {
            method: 'PUT',
            body: { data: { Dimensions: windowData.Dimensions } }
          })
          console.log(`✅ Updated window ${i + 1}`)
        } else {
          console.error(`❌ No valid ID found for window ${i + 1}:`, existingWindows[i])
        }
      } else {
        // Create new window and connect to floor
        const newWindow = await client('/api/windows', {
          method: 'POST',
          body: { 
            data: { 
              Description: `Window ${i + 1}`,
              Dimensions: windowData.Dimensions,
              Type: 'Single',
              Style: 'Modern'
            } 
          }
        })
        
        // Connect to floor
        await client(`/api/floors/${floorId}`, {
          method: 'PUT',
          body: { 
            data: { 
              Windows: [...existingWindows.map((w: any) => w.documentId), newWindow.data.documentId]
            } 
          }
        })
        console.log(`✅ Created new window ${i + 1}`)
      }
    }
  }
  
  // Helper function to update Doors for a floor
  const updateDoorsForFloor = async (floorId: string, doorsData: any[]): Promise<void> => {
    console.log('🚪 Updating Doors for floor:', floorId)
    
    // Get existing doors
    const floorResponse = await client<{data: any}>(`/api/floors/${floorId}?populate[Doors]=true`)
    const existingDoors = floorResponse.data.Doors || []
    
    console.log('🔍 Existing doors structure:', JSON.stringify(existingDoors, null, 2))
    
    // Update each door by index
    for (let i = 0; i < doorsData.length; i++) {
      const doorData = doorsData[i]
      
      if (existingDoors[i]) {
        // Check for different possible ID properties
        const doorId = existingDoors[i].documentId || existingDoors[i].id || existingDoors[i].Id
        console.log(`🔍 Door ${i + 1} ID:`, doorId, 'from object:', existingDoors[i])
        
        if (doorId) {
          await client(`/api/doors/${doorId}`, {
            method: 'PUT',
            body: { data: { Dimensions: doorData.Dimensions } }
          })
          console.log(`✅ Updated door ${i + 1}`)
        } else {
          console.error(`❌ No valid ID found for door ${i + 1}:`, existingDoors[i])
        }
      } else {
        // Create new door and connect to floor
        const newDoor = await client('/api/doors', {
          method: 'POST',
          body: { 
            data: { 
              Description: `Door ${i + 1}`,
              Dimensions: doorData.Dimensions,
              Type: 'Single',
              Style: 'Modern'
            } 
          }
        })
        
        // Connect to floor
        await client(`/api/floors/${floorId}`, {
          method: 'PUT',
          body: { 
            data: { 
              Doors: [...existingDoors.map((d: any) => d.documentId), newDoor.data.documentId]
            } 
          }
        })
        console.log(`✅ Created new door ${i + 1}`)
      }
    }
  }
  
  // Helper function to update floors as separate entities (relations)
  const updateFloorsAsRelations = async (buildingId: string, floorsData: any[]): Promise<void> => {
    console.log('🏠 Updating floors as relations...')
    
    // Get existing floors for this building
    const buildingResponse = await client<{data: any}>(`/api/buildings/${buildingId}?populate=floors`)
    const existingFloors = buildingResponse.data.floors || []
    
    console.log(`🔍 Found ${existingFloors.length} existing floors, need ${floorsData.length} floors`)
    
    const floorIds: string[] = []
    
    // Process each floor from the frontend
    for (let i = 0; i < floorsData.length; i++) {
      const floorData = floorsData[i]
      const existingFloor = existingFloors.find((f: any) => f.Storey === floorData.Storey)
      
      if (existingFloor) {
        // Update existing floor
        console.log(`🔄 Updating existing floor (Storey ${floorData.Storey})...`)
        console.log(`🔍 Floor data for update:`, JSON.stringify(floorData, null, 2))
        await client(`/api/floors/${existingFloor.documentId}`, {
          method: 'PUT',
          body: { data: floorData }
        })
        floorIds.push(existingFloor.documentId)
      } else {
        // Create new floor
        console.log(`🆕 Creating new floor (Storey ${floorData.Storey})...`)
        console.log(`🔍 Floor data being sent:`, JSON.stringify(floorData, null, 2))
        const newFloor = await client('/api/floors', {
          method: 'POST',
          body: { data: floorData }
        })
        floorIds.push(newFloor.data.documentId)
      }
    }
    
    // Update building with all floor IDs
    await client(`/api/buildings/${buildingId}`, {
      method: 'PUT',
      body: { 
        data: { 
          floors: floorIds
        } 
      }
    })
    
    console.log(`✅ Updated building with ${floorIds.length} floors`)
  }

  // Helper function to update roof relations
  const updateRoofRelations = async (buildingId: string, roofData: any[]): Promise<void> => {
    console.log('🏠 Updating roof relations...')
    
    // Roofs are components within buildings, not standalone entities
    // Update the building with the new roof data directly
    await client(`/api/buildings/${buildingId}`, {
      method: 'PUT',
      body: { 
        data: { 
          Roof: roofData
        } 
      }
    })
    
    console.log('✅ Updated roof component in building')
  }

  const saveBuildingRelations = async (projectId: string, project: Project | Omit<Project, 'id'>): Promise<void> => {
    const operation = `Save Building Relations (Project: ${projectId})`
    console.log(`🏗️ ${operation} - Starting...`)
    
    // First, try to get existing building for this project
    let buildingId: string | null = null
    
    try {
      console.log('🔍 Checking for existing building...')
      const existingProject = await client<{data: any}>(`/api/projects/${projectId}?populate[building]=true`)
      buildingId = existingProject.data.building?.documentId || null
      
      console.log('✅ Existing building check result:', {
        hasBuildingRelation: !!existingProject.data.building,
        buildingId,
        buildingType: typeof existingProject.data.building
      })
    } catch (error) {
      logApiError('Check Existing Building', error, { projectId })
      console.log('ℹ️ No existing building found or error occurred, will create new one')
    }
    
    // Transform all floors (now supports multiple floors)
    const floorsArray = Object.values(project.floors).map(floor => {
      const transformed = transformFloorToStrapi(floor)
      console.log(`🔄 Transformed floor ${floor.storey}:`, JSON.stringify(transformed, null, 2))
      return transformed
    })
    
    // Prepare building data with transformed floors and roof
    const buildingData = {
      Description: `Building for project: ${project.name || 'Unnamed Project'}`,
      floors: floorsArray,
      Roof: project.roof ? [transformRoofToStrapi(project.roof)] : []
    }
    
    console.log('📦 Building data to save:', {
      floorsCount: buildingData.floors?.length || 0,
      floorStoreys: buildingData.floors?.map(f => f.Storey) || [],
      roofCount: buildingData.Roof?.length || 0,
      roofType: buildingData.Roof?.[0]?.Type
    })
    
    // Log detailed building data for debugging
    console.log('🔍 Detailed building data:', JSON.stringify(buildingData, null, 2))
    
    try {
      if (buildingId) {
        // Update existing building with relations strategy
        const updateOperation = `Update Building (${buildingId})`
        console.log(`🔄 ${updateOperation} - Starting...`)
        
        // Step 1: Update building basic data only (without embedded relations)
        const basicBuildingData = {
          Description: buildingData.Description
          // Don't include floors or Roof here - will update separately
        }
        
        await client<{data: any}>(`/api/buildings/${buildingId}`, {
          method: 'PUT',
          body: { data: basicBuildingData }
        })
        
        console.log(`✅ Basic building data updated`)
        
        // Step 2: Handle floors as separate entities (relations, not components)
        if (buildingData.floors && buildingData.floors.length > 0) {
          await updateFloorsAsRelations(buildingId, buildingData.floors)
        }
        
        // Step 3: Update roof separately 
        if (buildingData.Roof && buildingData.Roof.length > 0) {
          await updateRoofRelations(buildingId, buildingData.Roof)
        }
        
        console.log(`✅ ${updateOperation} - All relations updated successfully`)
        
        // Verify the update actually worked by fetching the building WITH relations
        const verificationResponse = await client<{data: any}>(`/api/buildings/${buildingId}?populate[floors][populate][Windows]=true&populate[floors][populate][Doors]=true&populate[Roof]=true`)
        console.log('🔍 Building after update (populated):', JSON.stringify(verificationResponse.data, null, 2))
        
        // Verify that the relations are actually populated
        if (!verificationResponse.data.floors?.length && !verificationResponse.data.Roof?.length) {
          console.warn('⚠️ Warning: Building verification shows no populated relations!')
        } else {
          console.log('✅ Verification successful - building has populated relations:', {
            floorsCount: verificationResponse.data.floors?.length || 0,
            roofCount: verificationResponse.data.Roof?.length || 0
          })
        }
      } else {
        // Create new building and connect to project
        const createOperation = 'Create New Building'
        console.log(`🆕 ${createOperation} - Starting...`)
        
        const buildingResponse = await client<{data: any}>('/api/buildings', {
          method: 'POST',
          body: { data: buildingData }
        })
        
        const newBuildingId = buildingResponse.data.documentId
        console.log(`✅ ${createOperation} - Success:`, {
          buildingId: newBuildingId,
          hasDocumentId: !!newBuildingId
        })
        
        // Connect building to project
        const connectOperation = `Connect Building to Project (${newBuildingId} -> ${projectId})`
        console.log(`🔗 ${connectOperation} - Starting...`)
        
        await client(`/api/projects/${projectId}`, {
          method: 'PUT',
          body: { 
            data: { 
              building: newBuildingId 
            } 
          }
        })
        
        console.log(`✅ ${connectOperation} - Success`)
      }
      
      console.log(`✅ ${operation} - All operations completed successfully`)
    } catch (error) {
      logApiError(operation, error, {
        projectId,
        buildingId,
        buildingDataKeys: Object.keys(buildingData),
        hasFloorData: !!buildingData.floor,
        hasRoofData: buildingData.Roof.length > 0
      })
      throw error
    }
  }

  // API endpoint testing function for debugging permissions
  const testApiEndpoints = async () => {
    console.group('🧪 Testing Strapi API Endpoints')
    
    const testResults = {
      projects: null as any,
      buildings: null as any,
      projectsWithPopulate: null as any,
      buildingsCreate: null as any,
      specificProject: null as any,
      specificBuilding: null as any
    }
    
    // Test basic endpoints
    testResults.projects = await testApiEndpoint(client, '/api/projects')
    testResults.buildings = await testApiEndpoint(client, '/api/buildings')
    
    // Test populated queries
    testResults.projectsWithPopulate = await testApiEndpoint(
      client, 
      '/api/projects?populate[building][populate][floor]=true&populate[building][populate][Roof]=true'
    )
    
    // Test specific project if one exists
    if (testResults.projects.success && testResults.projects.response?.data?.length > 0) {
      const firstProjectId = testResults.projects.response.data[0].documentId
      testResults.specificProject = await testApiEndpoint(
        client,
        `/api/projects/${firstProjectId}?populate[building][populate][floor]=true&populate[building][populate][Roof]=true`
      )
    }
    
    // Test building creation with minimal data (including required fields)
    const minimalBuildingData = {
      Description: 'Test building for API validation', // Required field
      floor: {
        Storey: 0,
        Dimensions: { height: 250 },
        HeightPosition: 0,
        Color: '#ffffff'
      }
    }
    
    testResults.buildingsCreate = await testApiEndpoint(
      client,
      '/api/buildings',
      'POST',
      { data: minimalBuildingData }
    )
    
    // If building was created, test fetching it
    if (testResults.buildingsCreate.success) {
      const buildingId = testResults.buildingsCreate.response.data.documentId
      testResults.specificBuilding = await testApiEndpoint(
        client,
        `/api/buildings/${buildingId}`
      )
      
      // Clean up test building
      try {
        await client(`/api/buildings/${buildingId}`, { method: 'DELETE' })
        console.log('🧹 Cleaned up test building')
      } catch (error) {
        console.log('⚠️ Could not clean up test building:', error)
      }
    }
    
    console.log('📊 API Test Results Summary:', {
      projects: testResults.projects?.success ? '✅ OK' : '❌ FAILED',
      buildings: testResults.buildings?.success ? '✅ OK' : '❌ FAILED',
      projectsWithPopulate: testResults.projectsWithPopulate?.success ? '✅ OK' : '❌ FAILED',
      buildingsCreate: testResults.buildingsCreate?.success ? '✅ OK' : '❌ FAILED',
      specificProject: testResults.specificProject?.success ? '✅ OK' : (testResults.specificProject === null ? 'SKIPPED' : '❌ FAILED'),
      specificBuilding: testResults.specificBuilding?.success ? '✅ OK' : (testResults.specificBuilding === null ? 'SKIPPED' : '❌ FAILED')
    })
    
    console.groupEnd()
    
    return testResults
  }
  
  // Test different building creation strategies
  const testBuildingCreationStrategies = async () => {
    console.group('🧪 Testing Building Creation Strategies')
    
    const strategies = {
      minimalFields: false,
      withoutRelations: false,
      emptyRelations: false,
      nullRelations: false
    }
    
    // Strategy 1: Minimal fields only
    try {
      console.log('🔬 Testing minimal fields strategy...')
      const response1 = await client('/api/buildings', {
        method: 'POST',
        body: { data: {} }
      })
      strategies.minimalFields = true
      console.log('✅ Minimal fields worked')
      
      // Clean up
      await client(`/api/buildings/${response1.data.documentId}`, { method: 'DELETE' })
    } catch (error: any) {
      console.log('❌ Minimal fields failed:', error.status, error.statusText)
    }
    
    // Strategy 2: Without relations
    try {
      console.log('🔬 Testing without relations...')
      const response2 = await client('/api/buildings', {
        method: 'POST',
        body: { data: { someField: 'test' } }
      })
      strategies.withoutRelations = true
      console.log('✅ Without relations worked')
      
      // Clean up
      await client(`/api/buildings/${response2.data.documentId}`, { method: 'DELETE' })
    } catch (error: any) {
      console.log('❌ Without relations failed:', error.status, error.statusText)
    }
    
    // Strategy 3: Empty relations
    try {
      console.log('🔬 Testing empty relations...')
      const response3 = await client('/api/buildings', {
        method: 'POST',
        body: { 
          data: { 
            floor: {},
            Roof: []
          } 
        }
      })
      strategies.emptyRelations = true
      console.log('✅ Empty relations worked')
      
      // Clean up
      await client(`/api/buildings/${response3.data.documentId}`, { method: 'DELETE' })
    } catch (error: any) {
      console.log('❌ Empty relations failed:', error.status, error.statusText)
    }
    
    // Strategy 4: Null relations
    try {
      console.log('🔬 Testing null relations...')
      const response4 = await client('/api/buildings', {
        method: 'POST',
        body: { 
          data: { 
            floor: null,
            Roof: null
          } 
        }
      })
      strategies.nullRelations = true
      console.log('✅ Null relations worked')
      
      // Clean up
      await client(`/api/buildings/${response4.data.documentId}`, { method: 'DELETE' })
    } catch (error: any) {
      console.log('❌ Null relations failed:', error.status, error.statusText)
    }
    
    console.log('🔬 Building Creation Strategy Results:', strategies)
    console.groupEnd()
    
    return strategies
  }

  // Quick permission check function
  const checkPermissions = async () => {
    console.group('🔐 Checking Strapi Permissions')
    
    const permissions = {
      canReadProjects: false,
      canReadBuildings: false,
      canCreateBuildings: false,
      canUpdateBuildings: false,
      canPopulateRelations: false
    }
    
    // Check read permissions
    try {
      await client('/api/projects')
      permissions.canReadProjects = true
    } catch (error) {
      console.log('❌ Cannot read projects')
    }
    
    try {
      await client('/api/buildings')
      permissions.canReadBuildings = true
    } catch (error) {
      console.log('❌ Cannot read buildings')
    }
    
    // Check populate permissions
    try {
      await client('/api/projects?populate[building]=true')
      permissions.canPopulateRelations = true
    } catch (error) {
      console.log('❌ Cannot populate relations')
    }
    
    // Check create permissions with minimal data
    try {
      const testBuilding = await client('/api/buildings', {
        method: 'POST',
        body: { 
          data: { 
            Description: 'Permission test building', // Required field
            floor: { 
              Storey: 999,
              Dimensions: { height: 1 }
            } 
          } 
        }
      })
      permissions.canCreateBuildings = true
      
      // Test update if create worked
      try {
        await client(`/api/buildings/${testBuilding.data.documentId}`, {
          method: 'PUT',
          body: { 
            data: { 
              floor: { 
                Storey: 999,
                Dimensions: { height: 2 }
              } 
            } 
          }
        })
        permissions.canUpdateBuildings = true
      } catch (error) {
        console.log('❌ Cannot update buildings')
      }
      
      // Clean up
      try {
        await client(`/api/buildings/${testBuilding.data.documentId}`, { method: 'DELETE' })
      } catch (error) {
        console.log('⚠️ Could not clean up test building')
      }
    } catch (error) {
      console.log('❌ Cannot create buildings')
    }
    
    console.log('🔐 Permissions Summary:', permissions)
    console.groupEnd()
    
    return permissions
  }

  // Delete operations for individual elements
  const deleteWindow = async (projectId: string, floorId: string, windowId: string): Promise<void> => {
    const operation = `Delete Window (${windowId} from Floor ${floorId})`
    console.log(`🗑️ ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Remove the window from the project data
      const updatedProject = { ...project }
      const floor = updatedProject.floors[floorId]
      if (floor?.windows?.[windowId]) {
        delete floor.windows[windowId]
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success`)
      } else {
        console.warn(`⚠️ ${operation} - Window not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId, windowId })
      throw error
    }
  }

  const deleteDoor = async (projectId: string, floorId: string, doorId: string): Promise<void> => {
    const operation = `Delete Door (${doorId} from Floor ${floorId})`
    console.log(`🗑️ ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Remove the door from the project data
      const updatedProject = { ...project }
      const floor = updatedProject.floors[floorId]
      if (floor?.doors?.[doorId]) {
        delete floor.doors[doorId]
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success`)
      } else {
        console.warn(`⚠️ ${operation} - Door not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId, doorId })
      throw error
    }
  }

  const deleteFloor = async (projectId: string, floorId: string): Promise<void> => {
    const operation = `Delete Floor (${floorId})`
    console.log(`🗑️ ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Remove the floor from the project data
      const updatedProject = { ...project }
      if (updatedProject.floors[floorId]) {
        delete updatedProject.floors[floorId]
        
        // Update roof position to sit on top of remaining floors
        if (updatedProject.roof && Object.keys(updatedProject.floors).length > 0) {
          const remainingFloors = Object.values(updatedProject.floors)
          const highestFloor = remainingFloors.reduce((max, floor) => 
            Math.max(max, floor.heightPosition + floor.height), 0)
          updatedProject.roof.heightPosition = highestFloor
        }
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success`)
      } else {
        console.warn(`⚠️ ${operation} - Floor not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId })
      throw error
    }
  }

  const deleteRoof = async (projectId: string): Promise<void> => {
    const operation = `Delete Roof`
    console.log(`🗑️ ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Remove the roof from the project data
      const updatedProject = { ...project }
      updatedProject.roof = undefined
      
      // Save the updated project back to Strapi
      await saveProject(updatedProject)
      console.log(`✅ ${operation} - Success`)
    } catch (error) {
      logApiError(operation, error, { projectId })
      throw error
    }
  }

  // Duplicate operations for individual elements
  const duplicateWindow = async (projectId: string, floorId: string, windowId: string): Promise<string> => {
    const operation = `Duplicate Window (${windowId} on Floor ${floorId})`
    console.log(`📋 ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Duplicate the window with a new ID
      const updatedProject = { ...project }
      const floor = updatedProject.floors[floorId]
      if (floor?.windows?.[windowId]) {
        const originalWindow = floor.windows[windowId]
        
        // Find next available window ID
        const existingIds = Object.keys(floor.windows).map(k => parseInt(k)).filter(n => !isNaN(n))
        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
        const newWindowId = String(nextId)
        
        // Create duplicate with slight position offset
        floor.windows[newWindowId] = {
          ...originalWindow,
          position: {
            ...originalWindow.position,
            x: originalWindow.position.x + 50 // Offset by 50cm
          }
        }
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success, new ID: ${newWindowId}`)
        return newWindowId
      } else {
        throw new Error(`Window ${windowId} not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId, windowId })
      throw error
    }
  }

  const duplicateDoor = async (projectId: string, floorId: string, doorId: string): Promise<string> => {
    const operation = `Duplicate Door (${doorId} on Floor ${floorId})`
    console.log(`📋 ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Duplicate the door with a new ID
      const updatedProject = { ...project }
      const floor = updatedProject.floors[floorId]
      if (floor?.doors?.[doorId]) {
        const originalDoor = floor.doors[doorId]
        
        // Find next available door ID
        const existingIds = Object.keys(floor.doors).map(k => parseInt(k)).filter(n => !isNaN(n))
        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
        const newDoorId = String(nextId)
        
        // Create duplicate with slight position offset
        floor.doors[newDoorId] = {
          ...originalDoor,
          position: {
            ...originalDoor.position,
            x: originalDoor.position.x + 50 // Offset by 50cm
          }
        }
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success, new ID: ${newDoorId}`)
        return newDoorId
      } else {
        throw new Error(`Door ${doorId} not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId, doorId })
      throw error
    }
  }

  const duplicateFloor = async (projectId: string, floorId: string): Promise<string> => {
    const operation = `Duplicate Floor (${floorId})`
    console.log(`📋 ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Duplicate the floor with a new ID
      const updatedProject = { ...project }
      const originalFloor = updatedProject.floors[floorId]
      if (originalFloor) {
        // Generate new floor ID and calculate height position
        const existingStoreys = Object.values(updatedProject.floors).map((floor: any) => floor.storey)
        const maxStorey = existingStoreys.length > 0 ? Math.max(...existingStoreys) : -1
        const newFloorId = String(maxStorey + 1)
        
        // Calculate height position
        let maxPosition = 0
        for (const floor of Object.values(updatedProject.floors) as any[]) {
          const topPosition = floor.heightPosition + floor.height
          if (topPosition > maxPosition) {
            maxPosition = topPosition
          }
        }
        
        // Create duplicated floor
        const duplicatedFloor = {
          ...originalFloor,
          storey: parseInt(newFloorId),
          heightPosition: maxPosition,
          // Duplicate all windows and doors with new IDs
          windows: Object.fromEntries(
            Object.entries(originalFloor.windows || {}).map(([_, window], index) => [
              String(index + 1), { ...window }
            ])
          ),
          doors: Object.fromEntries(
            Object.entries(originalFloor.doors || {}).map(([_, door], index) => [
              String(index + 1), { ...door }
            ])
          )
        }
        
        updatedProject.floors[newFloorId] = duplicatedFloor
        
        // Update roof position to sit on top of all floors
        if (updatedProject.roof) {
          const highestFloor = Object.values(updatedProject.floors).reduce((max: number, floor: any) => 
            Math.max(max, floor.heightPosition + floor.height), 0)
          updatedProject.roof.heightPosition = highestFloor
        }
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success, new ID: ${newFloorId}`)
        return newFloorId
      } else {
        throw new Error(`Floor ${floorId} not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId })
      throw error
    }
  }

  // Transform operations
  const transformWindowToDoor = async (projectId: string, floorId: string, windowId: string): Promise<string> => {
    const operation = `Transform Window to Door (${windowId} on Floor ${floorId})`
    console.log(`🔄 ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Transform the window to a door
      const updatedProject = { ...project }
      const floor = updatedProject.floors[floorId]
      if (floor?.windows?.[windowId]) {
        const window = floor.windows[windowId]
        
        // Find next available door ID
        const existingDoorIds = Object.keys(floor.doors || {}).map(k => parseInt(k)).filter(n => !isNaN(n))
        const nextDoorId = existingDoorIds.length > 0 ? Math.max(...existingDoorIds) + 1 : 1
        const newDoorId = String(nextDoorId)
        
        // Create door with window properties but door-appropriate dimensions
        const newDoor = {
          width: Math.max(window.width, 80), // Ensure minimum door width
          height: Math.max(window.height, 200), // Ensure minimum door height
          position: { ...window.position }
        }
        
        // Remove window and add door
        delete floor.windows[windowId]
        if (!floor.doors) floor.doors = {}
        floor.doors[newDoorId] = newDoor
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success, new door ID: ${newDoorId}`)
        return newDoorId
      } else {
        throw new Error(`Window ${windowId} not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId, windowId })
      throw error
    }
  }

  const transformDoorToWindow = async (projectId: string, floorId: string, doorId: string): Promise<string> => {
    const operation = `Transform Door to Window (${doorId} on Floor ${floorId})`
    console.log(`🔄 ${operation} - Starting...`)
    
    try {
      // Load the current project to get the building structure
      const project = await loadProject(projectId)
      
      // Transform the door to a window
      const updatedProject = { ...project }
      const floor = updatedProject.floors[floorId]
      if (floor?.doors?.[doorId]) {
        const door = floor.doors[doorId]
        
        // Find next available window ID
        const existingWindowIds = Object.keys(floor.windows || {}).map(k => parseInt(k)).filter(n => !isNaN(n))
        const nextWindowId = existingWindowIds.length > 0 ? Math.max(...existingWindowIds) + 1 : 1
        const newWindowId = String(nextWindowId)
        
        // Create window with door properties but window-appropriate dimensions
        const newWindow = {
          width: Math.min(door.width, 150), // Typical window width
          height: Math.min(door.height, 150), // Typical window height
          position: { ...door.position }
        }
        
        // Remove door and add window
        delete floor.doors[doorId]
        if (!floor.windows) floor.windows = {}
        floor.windows[newWindowId] = newWindow
        
        // Save the updated project back to Strapi
        await saveProject(updatedProject)
        console.log(`✅ ${operation} - Success, new window ID: ${newWindowId}`)
        return newWindowId
      } else {
        throw new Error(`Door ${doorId} not found`)
      }
    } catch (error) {
      logApiError(operation, error, { projectId, floorId, doorId })
      throw error
    }
  }

  // Get available roof type options from Strapi
  const getRoofTypeOptions = () => {
    // Based on the typeMap in convertRoofType function
    // These are the roof types supported in Strapi
    const strapiRoofTypes = [
      'Gable',
      'Hip', 
      'Flat',
      'Shed',
      'Butterfly',
      'Gambrel',
      'Mansard',
      'M Shaped',
      'Pyramid'
    ]
    
    // Convert Strapi roof types back to frontend format
    const convertRoofType = (strapiType: string): Roof['type'] => {
      const typeMap: Record<string, Roof['type']> = {
        'Gable': 'gable',
        'Hip': 'hip', 
        'Flat': 'flat',
        'Shed': 'shed',
        'Butterfly': 'gable', // Map unsupported types to gable
        'Gambrel': 'gable',
        'Mansard': 'gable',
        'M Shaped': 'gable',
        'Pyramid': 'hip'
      }
      return typeMap[strapiType] || 'gable' // Default to gable
    }
    
    // Return both display and value for dropdown
    return strapiRoofTypes.map(type => ({
      label: type,
      value: type,
      // Map to frontend type for comparison
      frontendType: convertRoofType(type)
    }))
  }

  // Renovation Works API methods
  const apiCall = async (endpoint: string, options: any = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    // TODO: Add authentication when auth system is ready
    // const { data: user } = await useAuth()
    // if (user.value?.jwt) {
    //   headers.Authorization = `Bearer ${user.value.jwt}`
    // }
    
    return await client(endpoint, {
      ...options,
      headers
    })
  }

  const fetchUserRenovationWorks = async (userId?: string) => {
    const operation = 'Fetch User Renovation Works'
    console.log(`🔨 ${operation} - Starting...`)
    
    try {
      // Start with basic endpoint and try to populate everything available
      let endpoint = '/api/renovation-works?populate=*&sort=createdAt:desc'
      
      if (userId) {
        endpoint += `&filters[user][id][$eq]=${userId}`
      }
      
      console.log(`🔗 API endpoint: ${endpoint}`)
      
      const response = await apiCall(endpoint, { method: 'GET' })
      
      console.log(`✅ ${operation} - Success:`, {
        workCount: response.data?.length || 0,
        sampleData: response.data?.[0] || 'No data'
      })
      
      // Transform data flexibly - handle whatever fields exist
      return response.data.map((item: any) => {
        console.log(`🔄 Transforming item:`, item)
        
        return {
          id: item.documentId || item.id,  // Use documentId as primary ID for Strapi v5
          name: item.Name || item.name || 'Untitled Work',
          description: item.Description || item.description || '',
          budget: Number(item.Budget || item.budget || 0),
          actualCost: item.ActualCost || item.actualCost || undefined,
          status: (item.ScheduledStatus || item.status || 'planned').toLowerCase(),
          executionType: item.executionType || 'DIY',
          timeline: (item.Timeline || item.timeline || 'now').toLowerCase(),
          year: item.Year || item.year || undefined,
          progress: Number(item.progress || 0),
          canActivate: Boolean(item.canActivate || false),
          contractor: item.Contractor || item.contractor || { name: null, phone: null, email: null },
          startDate: item.StartDate ? new Date(item.StartDate) : undefined,
          completedAt: item.CompletedAt ? new Date(item.CompletedAt) : undefined,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          todos: Array.isArray(item.todos) ? item.todos : [],
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
          projectId: item.project?.data?.id || item.project?.id || undefined
        }
      })
    } catch (error) {
      console.log(`🔍 Detailed error info:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        data: (error as any)?.data
      })
      
      // If populate=* fails, try without populate
      if ((error as any)?.status === 400) {
        console.log(`🔄 Retrying without populate...`)
        try {
          let fallbackEndpoint = '/api/renovation-works?sort=createdAt:desc'
          if (userId) {
            fallbackEndpoint += `&filters[user][id][$eq]=${userId}`
          }
          
          const fallbackResponse = await apiCall(fallbackEndpoint, { method: 'GET' })
          console.log(`✅ Fallback successful:`, { workCount: fallbackResponse.data?.length || 0 })
          
          return fallbackResponse.data.map((item: any) => ({
            id: item.id || item.documentId,
            name: item.Name || item.name || 'Untitled Work',
            description: item.Description || item.description || '',
            budget: Number(item.Budget || item.budget || 0),
            actualCost: item.ActualCost || item.actualCost || undefined,
            status: (item.ScheduledStatus || item.status || 'planned').toLowerCase(),
            executionType: item.executionType || 'DIY',
            timeline: (item.Timeline || item.timeline || 'now').toLowerCase(),
            year: item.Year || item.year || undefined,
            progress: Number(item.progress || 0),
            canActivate: Boolean(item.canActivate || false),
            contractor: item.Contractor || item.contractor || { name: null, phone: null, email: null },
            startDate: item.StartDate ? new Date(item.StartDate) : undefined,
            completedAt: item.CompletedAt ? new Date(item.CompletedAt) : undefined,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
            todos: [],
            attachments: [],
            projectId: undefined
          }))
        } catch (fallbackError) {
          logApiError(`${operation} (fallback)`, fallbackError, { userId })
          throw new Error(`Failed to fetch renovation works: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
        }
      }
      
      logApiError(operation, error, { userId })
      throw new Error(`Failed to fetch renovation works: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const createRenovationWork = async (workData: any) => {
    const operation = 'Create Renovation Work'
    console.log(`🔨 ${operation} - Starting...`)
    
    try {
      // Map to Strapi's expected field names and values
      const strapiData = {
        Name: workData.name,
        Description: workData.description,
        Budget: workData.budget,
        ScheduledStatus: workData.status ? 
          workData.status.charAt(0).toUpperCase() + workData.status.slice(1) : 'Planned',
        executionType: workData.executionType || 'DIY',
        Timeline: workData.timeline ? 
          workData.timeline.charAt(0).toUpperCase() + workData.timeline.slice(1) : 'Now',
        Year: workData.year || new Date().getFullYear(),
        canActivate: workData.canActivate || false,
        progress: workData.progress || 0,
        Contractor: workData.contractor || { name: null, phone: null, email: null }
      }
      
      // Add user relation if available
      if (workData.userId) {
        strapiData.user = workData.userId
      }
      
      // Add project relation if available  
      if (workData.projectId) {
        strapiData.project = workData.projectId
      }
      
      const response = await apiCall('/api/renovation-works', {
        method: 'POST',
        body: { data: strapiData }
      })
      
      console.log(`✅ ${operation} - Success`)
      
      // Transform response back to frontend format
      return {
        id: response.data.id || response.data.documentId,
        name: response.data.Name || response.data.name,
        description: response.data.Description || response.data.description,
        budget: response.data.Budget || response.data.budget || 0,
        actualCost: response.data.ActualCost || response.data.actualCost,
        status: (response.data.ScheduledStatus || response.data.status || 'planned').toLowerCase(),
        executionType: response.data.executionType || 'DIY',
        timeline: (response.data.Timeline || response.data.timeline || 'now').toLowerCase(),
        year: response.data.Year || response.data.year,
        progress: response.data.progress || 0,
        canActivate: response.data.canActivate || false,
        contractor: response.data.Contractor || response.data.contractor || { name: null, phone: null, email: null },
        startDate: response.data.StartDate ? new Date(response.data.StartDate) : undefined,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        todos: [],
        attachments: []
      }
    } catch (error) {
      logApiError(operation, error, { workData })
      throw new Error(`Failed to create renovation work: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const updateRenovationWork = async (workId: string, updates: any) => {
    const operation = `Update Renovation Work (${workId})`
    console.log(`🔨 ${operation} - Starting...`)
    
    try {
      // First, we need to get the actual ID format Strapi expects
      // Try to get the work first to determine the right ID to use
      let strapiId = workId
      
      // If the workId looks like a number, keep it. Otherwise it might be a documentId
      const isNumericId = /^\d+$/.test(workId)
      
      if (!isNumericId) {
        // This might be a documentId, we need to find the actual work
        const works = await apiCall('/api/renovation-works', { method: 'GET' })
        const foundWork = works.data.find((w: any) => 
          w.id === workId || w.documentId === workId
        )
        if (foundWork) {
          strapiId = foundWork.documentId || foundWork.id
        }
      }
      
      // Map to Strapi's expected field names
      const strapiData: any = {}
      
      if (updates.name !== undefined) strapiData.Name = updates.name
      if (updates.description !== undefined) strapiData.Description = updates.description
      if (updates.budget !== undefined) strapiData.Budget = updates.budget
      if (updates.actualCost !== undefined) strapiData.ActualCost = updates.actualCost
      if (updates.status !== undefined) {
        strapiData.ScheduledStatus = updates.status.charAt(0).toUpperCase() + updates.status.slice(1)
      }
      if (updates.executionType !== undefined) strapiData.executionType = updates.executionType
      if (updates.timeline !== undefined) {
        strapiData.Timeline = updates.timeline.charAt(0).toUpperCase() + updates.timeline.slice(1)
      }
      if (updates.year !== undefined) strapiData.Year = updates.year
      if (updates.progress !== undefined) strapiData.progress = updates.progress
      if (updates.canActivate !== undefined) strapiData.canActivate = updates.canActivate
      if (updates.contractor !== undefined) {
        strapiData.Contractor = {
          name: updates.contractor.name || null,
          phone: updates.contractor.phone || null,
          email: updates.contractor.email || null
        }
      }
      if (updates.startDate !== undefined) {
        strapiData.StartDate = updates.startDate ? 
          (updates.startDate instanceof Date ? updates.startDate.toISOString() : updates.startDate) : null
      }
      if (updates.completedAt !== undefined) {
        strapiData.CompletedAt = updates.completedAt ? 
          (updates.completedAt instanceof Date ? updates.completedAt.toISOString() : updates.completedAt) : null
      }
      
      // Handle todos if they exist
      if (updates.todos !== undefined) {
        strapiData.todos = updates.todos.map((todo: any) => ({
          text: todo.text,
          completed: todo.completed
        }))
      }
      
      const response = await apiCall(`/api/renovation-works/${strapiId}`, {
        method: 'PUT',
        body: { data: strapiData }
      })
      
      console.log(`✅ ${operation} - Success`)
      
      // Transform response back to frontend format
      return {
        id: response.data.id || response.data.documentId,
        name: response.data.Name || response.data.name,
        description: response.data.Description || response.data.description,
        budget: response.data.Budget || response.data.budget || 0,
        actualCost: response.data.ActualCost || response.data.actualCost,
        status: (response.data.ScheduledStatus || response.data.status || 'planned').toLowerCase(),
        executionType: response.data.executionType || 'DIY',
        timeline: (response.data.Timeline || response.data.timeline || 'now').toLowerCase(),
        year: response.data.Year || response.data.year,
        progress: response.data.progress || 0,
        canActivate: response.data.canActivate || false,
        contractor: response.data.Contractor || response.data.contractor || { name: null, phone: null, email: null },
        startDate: response.data.StartDate ? new Date(response.data.StartDate) : undefined,
        completedAt: response.data.CompletedAt ? new Date(response.data.CompletedAt) : undefined,
        updatedAt: new Date(response.data.updatedAt),
        todos: response.data.todos || [],
        attachments: response.data.attachments || []
      }
    } catch (error) {
      logApiError(operation, error, { workId, updates })
      throw new Error(`Failed to update renovation work: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const deleteRenovationWork = async (workId: string) => {
    const operation = `Delete Renovation Work (${workId})`
    console.log(`🔨 ${operation} - Starting...`)
    
    try {
      // First, we need to get the actual ID format Strapi expects
      let strapiId = workId
      
      // If the workId looks like a number, keep it. Otherwise it might be a documentId
      const isNumericId = /^\d+$/.test(workId)
      
      if (!isNumericId) {
        // This might be a documentId, we need to find the actual work
        const works = await apiCall('/api/renovation-works', { method: 'GET' })
        const foundWork = works.data.find((w: any) => 
          w.id === workId || w.documentId === workId
        )
        if (foundWork) {
          strapiId = foundWork.documentId || foundWork.id
        }
      }
      
      await apiCall(`/api/renovation-works/${strapiId}`, { method: 'DELETE' })
      console.log(`✅ ${operation} - Success`)
      return true
    } catch (error) {
      logApiError(operation, error, { workId })
      throw new Error(`Failed to delete renovation work: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // File upload for renovation works
  const uploadFile = async (file: File, name: string) => {
    const operation = 'Upload File'
    console.log(`📁 ${operation} - Starting...`)
    
    try {
      const formData = new FormData()
      formData.append('files', file)
      
      const response = await fetch(`${strapiBaseURL}/api/upload`, {
        method: 'POST',
        // TODO: Add authentication when auth system is ready
        // headers: { 'Authorization': `Bearer ${user.value?.jwt}` },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }
      
      const uploadedFiles = await response.json()
      console.log(`✅ ${operation} - Success`)
      return uploadedFiles[0] // Return first uploaded file
    } catch (error) {
      logApiError(operation, error, { fileName: file.name, fileSize: file.size })
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const deleteFile = async (fileId: string) => {
    const operation = `Delete File (${fileId})`
    console.log(`📁 ${operation} - Starting...`)
    
    try {
      await apiCall(`/api/upload/files/${fileId}`, { method: 'DELETE' })
      console.log(`✅ ${operation} - Success`)
      return true
    } catch (error) {
      logApiError(operation, error, { fileId })
      return false
    }
  }

  // Information inquiry requests
  const saveInformationInquiry = async (email: string, topic: string, userData?: any) => {
    const operation = 'Save Information Inquiry'
    console.log(`📧 ${operation} - Starting...`, { email, topic })
    
    try {
      const requestData = {
        email,
        topic,
        userData: userData || null,
        notified: false
      }
      
      const response = await apiCall('/api/information-inquiries', {
        method: 'POST',
        body: { data: requestData }
      })
      
      console.log(`✅ ${operation} - Success`)
      return {
        success: true,
        id: response.data.id || response.data.documentId,
        message: `Email saved successfully! We'll notify you when ${topic} is available.`
      }
    } catch (error) {
      // Check if it's a duplicate email error
      if ((error as any)?.status === 400) {
        console.log(`ℹ️ ${operation} - Duplicate email, updating existing record`)
        try {
          // Try to update existing record instead
          const existingResponse = await apiCall(`/api/information-inquiries?filters[email][$eq]=${email}`)
          if (existingResponse.data && existingResponse.data.length > 0) {
            const existingId = existingResponse.data[0].documentId || existingResponse.data[0].id
            await apiCall(`/api/information-inquiries/${existingId}`, {
              method: 'PUT',
              body: { 
                data: { 
                  topic,
                  userData: userData || null,
                  updatedAt: new Date().toISOString()
                } 
              }
            })
            return {
              success: true,
              id: existingId,
              message: `Email updated! We'll notify you when ${topic} is available.`
            }
          }
        } catch (updateError) {
          // Fall through to generic error handling
        }
      }
      
      logApiError(operation, error, { email, topic })
      return {
        success: false,
        message: 'Failed to save email. Please try again later.'
      }
    }
  }

  const getInformationInquiries = async () => {
    const operation = 'Get Information Inquiries'
    console.log(`📧 ${operation} - Starting...`)
    
    try {
      const response = await apiCall('/api/information-inquiries?sort=createdAt:desc')
      console.log(`✅ ${operation} - Success`, { count: response.data?.length || 0 })
      
      return response.data.map((item: any) => ({
        id: item.documentId || item.id,
        email: item.email,
        topic: item.topic,
        notified: item.notified,
        userData: item.userData,
        notes: item.notes,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }))
    } catch (error) {
      logApiError(operation, error)
      return []
    }
  }

  return {
    client,
    // 3D Project methods
    loadProject,
    loadUserProjects,
    saveProject,
    updateProject,
    createProject,
    // Delete operations
    deleteWindow,
    deleteDoor,
    deleteFloor,
    deleteRoof,
    // Duplicate operations
    duplicateWindow,
    duplicateDoor,
    duplicateFloor,
    // Transform operations
    transformWindowToDoor,
    transformDoorToWindow,
    // Roof type options
    getRoofTypeOptions,
    // Renovation Works methods
    fetchUserRenovationWorks,
    createRenovationWork,
    updateRenovationWork,
    deleteRenovationWork,
    uploadFile,
    deleteFile,
    // Information inquiry methods
    saveInformationInquiry,
    getInformationInquiries,
    // Utility exports
    transformProject, // Export for testing
    transformProjectToStrapi, // Export for testing
    testApiEndpoints, // Export for debugging
    testBuildingCreationStrategies, // Export for debugging
    checkPermissions // Export for debugging
  }
}