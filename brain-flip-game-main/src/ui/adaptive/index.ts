/**
 * Adaptive UI System - Main exports
 * Sophisticated UI adaptation that feels effortless
 */

export { AdaptiveUIEngine, adaptiveUIEngine } from './AdaptiveUIEngine'
export { DeviceDetection, deviceDetection } from './DeviceDetection'
export { ResponsiveLayout, responsiveLayout } from './ResponsiveLayout'

export type {
  DeviceCapabilities,
  SkillProfile,
  UIConfiguration,
  LayoutConfiguration,
  AnimationSettings,
  InterfaceComplexity,
  AccessibilitySettings,
  EnvironmentContext
} from './AdaptiveUIEngine'

export type {
  DeviceInfo,
  DeviceFeatures
} from './DeviceDetection'

export type {
  LayoutBreakpoints,
  LayoutDimensions
} from './ResponsiveLayout'

/**
 * Initialize the adaptive UI system
 */
export async function initializeAdaptiveUI(): Promise<{
  deviceInfo: any
  uiConfig: UIConfiguration
  layoutConfig: any
}> {
  // Get device information
  const deviceInfo = await deviceDetection.getDeviceInfo()
  
  // Generate initial UI configuration
  const uiConfig = adaptiveUIEngine.generateConfiguration()
  
  // Get layout configuration
  const layoutConfig = responsiveLayout.getCurrentConfiguration()
  
  // Apply CSS custom properties
  const cssProps = responsiveLayout.getCSSCustomProperties()
  const root = document.documentElement
  
  Object.entries(cssProps).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
  
  return {
    deviceInfo,
    uiConfig,
    layoutConfig
  }
}

/**
 * React hook for adaptive UI (if using React)
 */
export function useAdaptiveUI() {
  // This would be implemented as a React hook
  // For now, returning the core functionality
  return {
    deviceInfo: null, // Would be populated by hook
    uiConfig: adaptiveUIEngine.generateConfiguration(),
    layoutConfig: responsiveLayout.getCurrentConfiguration(),
    updateSkillProfile: (profile: SkillProfile) => adaptiveUIEngine.updateSkillProfile(profile),
    updateEnvironment: (context: EnvironmentContext) => adaptiveUIEngine.updateEnvironmentContext(context)
  }
}