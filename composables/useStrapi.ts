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
  
  return {
    storey: strapiFloor.Storey,
    height: strapiFloor.Dimensions?.height || 250,
    heightPosition: strapiFloor.HeightPosition || (strapiFloor.Storey * 250),
    color: strapiFloor.Color || '#efefef',
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
    heightPosition: dimensions.heightPosition || 500
  }
}

// Reverse transformation: Convert frontend Project to Strapi format
const transformProjectToStrapi = (project: Project): any => {
  // Use existing transformation functions to handle building relations
  const mainFloor = project.floors['0'] // Use first floor only (Strapi schema limitation)
  
  const building = {
    Description: `Building for project: ${project.name || 'Unnamed Project'}`, // Required field
    floor: mainFloor ? transformFloorToStrapi(mainFloor) : null,
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
  return {
    Storey: floor.storey,
    Dimensions: {
      height: floor.height
    },
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
      const endpoint = `/api/projects/${projectId}?populate[building][populate][floor][populate][Windows]=true&populate[building][populate][floor][populate][Doors]=true&populate[building][populate][Roof]=true`
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
      const endpoint = '/api/projects?populate[building][populate][floor][populate][Windows]=true&populate[building][populate][floor][populate][Doors]=true&populate[building][populate][Roof]=true'
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
    
    const mainFloor = project.floors['0'] // Use first floor only (Strapi schema limitation)
    
    // Prepare building data with transformed floor and roof
    const buildingData = {
      Description: `Building for project: ${project.name || 'Unnamed Project'}`,
      floor: mainFloor ? transformFloorToStrapi(mainFloor) : null,
      Roof: project.roof ? [transformRoofToStrapi(project.roof)] : []
    }
    
    console.log('📦 Building data to save:', {
      hasFloor: !!buildingData.floor,
      floorStorey: buildingData.floor?.Storey,
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
          // Don't include floor or Roof here - will update separately
        }
        
        await client<{data: any}>(`/api/buildings/${buildingId}`, {
          method: 'PUT',
          body: { data: basicBuildingData }
        })
        
        console.log(`✅ Basic building data updated`)
        
        // Step 2: Update floor with complete Windows/Doors data
        if (buildingData.floor) {
          await updateFloorWithRelations(buildingId, buildingData.floor)
        }
        
        // Step 3: Update roof separately 
        if (buildingData.Roof && buildingData.Roof.length > 0) {
          await updateRoofRelations(buildingId, buildingData.Roof)
        }
        
        console.log(`✅ ${updateOperation} - All relations updated successfully`)
        
        // Verify the update actually worked by fetching the building WITH relations
        const verificationResponse = await client<{data: any}>(`/api/buildings/${buildingId}?populate[floor][populate][Windows]=true&populate[floor][populate][Doors]=true&populate[Roof]=true`)
        console.log('🔍 Building after update (populated):', JSON.stringify(verificationResponse.data, null, 2))
        
        // Verify that the relations are actually populated
        if (!verificationResponse.data.floor && !verificationResponse.data.Roof?.length) {
          console.warn('⚠️ Warning: Building verification shows no populated relations!')
        } else {
          console.log('✅ Verification successful - building has populated relations:', {
            hasFloor: !!verificationResponse.data.floor,
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

  return {
    client,
    loadProject,
    loadUserProjects,
    saveProject,
    updateProject,
    createProject,
    transformProject, // Export for testing
    transformProjectToStrapi, // Export for testing
    testApiEndpoints, // Export for debugging
    testBuildingCreationStrategies, // Export for debugging
    checkPermissions // Export for debugging
  }
}