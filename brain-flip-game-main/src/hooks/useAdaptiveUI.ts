/**
 * React Hook for Adaptive UI System
 * Provides reactive access to device-aware UI configuration
 */

import { useState, useEffect, useCallback } from 'react'
import {
  adaptiveUIEngine,
  deviceDetection,
  responsiveLayout,
  type UIConfiguration,
  type SkillProfile,
  type EnvironmentContext,
  type DeviceInfo,
  type LayoutConfiguration
} from '../ui/adaptive'

interface AdaptiveUIState {
  deviceInfo: DeviceInfo | null
  uiConfig: UIConfiguration
  layoutConfig: LayoutConfiguration
  isLoading: boolean
  error: string | null
}

interface AdaptiveUIActions {
  updateSkillProfile: (profile: SkillProfile) => void
  updateEnvironmentContext: (context: EnvironmentContext) => void
  refreshConfiguration: () => Promise<void>
}

export function useAdaptiveUI(): AdaptiveUIState & AdaptiveUIActions {
  const [state, setState] = useState<AdaptiveUIState>({
    deviceInfo: null,
    uiConfig: adaptiveUIEngine.generateConfiguration(),
    layoutConfig: responsiveLayout.getCurrentConfiguration(),
    isLoading: true,
    error: null
  })

  // Initialize adaptive UI system
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        const deviceInfo = await deviceDetection.getDeviceInfo()
        
        if (!mounted) return

        const uiConfig = adaptiveUIEngine.generateConfiguration()
        const layoutConfig = responsiveLayout.getCurrentConfiguration()

        // Apply CSS custom properties
        const cssProps = responsiveLayout.getCSSCustomProperties()
        const root = document.documentElement
        
        Object.entries(cssProps).forEach(([property, value]) => {
          root.style.setProperty(property, value)
        })

        setState(prev => ({
          ...prev,
          deviceInfo,
          uiConfig,
          layoutConfig,
          isLoading: false,
          error: null
        }))
      } catch (error) {
        if (!mounted) return
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize adaptive UI'
        }))
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  // Subscribe to layout changes
  useEffect(() => {
    const unsubscribe = responsiveLayout.subscribe((layoutConfig) => {
      setState(prev => ({
        ...prev,
        layoutConfig
      }))

      // Update CSS custom properties
      const cssProps = responsiveLayout.getCSSCustomProperties()
      const root = document.documentElement
      
      Object.entries(cssProps).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })
    })

    return unsubscribe
  }, [])

  // Update skill profile
  const updateSkillProfile = useCallback((profile: SkillProfile) => {
    const newUiConfig = adaptiveUIEngine.updateSkillProfile(profile)
    setState(prev => ({
      ...prev,
      uiConfig: newUiConfig
    }))
  }, [])

  // Update environment context
  const updateEnvironmentContext = useCallback((context: EnvironmentContext) => {
    const newUiConfig = adaptiveUIEngine.updateEnvironmentContext(context)
    setState(prev => ({
      ...prev,
      uiConfig: newUiConfig
    }))
  }, [])

  // Refresh configuration
  const refreshConfiguration = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const deviceInfo = await deviceDetection.getDeviceInfo()
      const uiConfig = adaptiveUIEngine.generateConfiguration()
      const layoutConfig = responsiveLayout.getCurrentConfiguration()

      setState(prev => ({
        ...prev,
        deviceInfo,
        uiConfig,
        layoutConfig,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh configuration'
      }))
    }
  }, [])

  return {
    ...state,
    updateSkillProfile,
    updateEnvironmentContext,
    refreshConfiguration
  }
}

/**
 * Hook for accessing current device type
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>(
    responsiveLayout.getDeviceType()
  )

  useEffect(() => {
    const unsubscribe = responsiveLayout.subscribe(() => {
      setDeviceType(responsiveLayout.getDeviceType())
    })

    return unsubscribe
  }, [])

  return deviceType
}

/**
 * Hook for accessing responsive breakpoints
 */
export function useBreakpoint(): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'wide'
} {
  const deviceType = useDeviceType()

  return {
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isWide: deviceType === 'wide',
    deviceType
  }
}

/**
 * Hook for accessing grid layout information
 */
export function useGridLayout() {
  const [gridLayout, setGridLayout] = useState(responsiveLayout.getGridLayout())

  useEffect(() => {
    const unsubscribe = responsiveLayout.subscribe(() => {
      setGridLayout(responsiveLayout.getGridLayout())
    })

    return unsubscribe
  }, [])

  return gridLayout
}