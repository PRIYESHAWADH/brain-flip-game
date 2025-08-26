/**
 * Responsive Layout System
 * Creates layouts that feel perfectly designed for each device
 */

export interface LayoutBreakpoints {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

export interface LayoutDimensions {
  width: number
  height: number
  availableWidth: number
  availableHeight: number
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface LayoutConfiguration {
  containerMaxWidth: number
  gridColumns: number
  gridGap: number
  buttonSize: number
  fontSize: {
    small: number
    medium: number
    large: number
    xlarge: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    small: number
    medium: number
    large: number
  }
}

export class ResponsiveLayout {
  private static instance: ResponsiveLayout
  private breakpoints: LayoutBreakpoints
  private currentDimensions: LayoutDimensions
  private resizeObserver: ResizeObserver | null = null
  private listeners: Array<(config: LayoutConfiguration) => void> = []

  static getInstance(): ResponsiveLayout {
    if (!ResponsiveLayout.instance) {
      ResponsiveLayout.instance = new ResponsiveLayout()
    }
    return ResponsiveLayout.instance
  }

  constructor() {
    this.breakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
      wide: 1440
    }

    this.currentDimensions = this.calculateDimensions()
    this.setupResizeObserver()
  }

  /**
   * Get current layout configuration based on screen size
   */
  getCurrentConfiguration(): LayoutConfiguration {
    const width = this.currentDimensions.width
    const deviceType = this.getDeviceType(width)

    switch (deviceType) {
      case 'mobile':
        return this.getMobileConfiguration()
      case 'tablet':
        return this.getTabletConfiguration()
      case 'desktop':
        return this.getDesktopConfiguration()
      case 'wide':
        return this.getWideConfiguration()
      default:
        return this.getMobileConfiguration()
    }
  }

  /**
   * Get device type based on width
   */
  getDeviceType(width?: number): 'mobile' | 'tablet' | 'desktop' | 'wide' {
    const w = width || this.currentDimensions.width

    if (w < this.breakpoints.mobile) return 'mobile'
    if (w < this.breakpoints.tablet) return 'mobile'
    if (w < this.breakpoints.desktop) return 'tablet'
    if (w < this.breakpoints.wide) return 'desktop'
    return 'wide'
  }

  /**
   * Get optimal grid layout for current screen
   */
  getGridLayout(): {
    columns: number
    rows: number
    cardWidth: number
    cardHeight: number
    gap: number
  } {
    const config = this.getCurrentConfiguration()
    const { availableWidth, availableHeight } = this.currentDimensions
    const deviceType = this.getDeviceType()

    // Calculate optimal card size based on device
    let cardAspectRatio = 1.2 // width:height ratio
    let columns = config.gridColumns
    let gap = config.gridGap

    // Adjust for device type
    if (deviceType === 'mobile') {
      cardAspectRatio = 1.0
      columns = Math.min(columns, 2)
    } else if (deviceType === 'tablet') {
      cardAspectRatio = 1.1
      columns = Math.min(columns, 3)
    }

    // Calculate card dimensions
    const totalGapWidth = (columns - 1) * gap
    const cardWidth = (availableWidth - totalGapWidth) / columns
    const cardHeight = cardWidth / cardAspectRatio

    // Calculate how many rows fit
    const rows = Math.floor((availableHeight - gap) / (cardHeight + gap))

    return {
      columns,
      rows: Math.max(1, rows),
      cardWidth,
      cardHeight,
      gap
    }
  }

  /**
   * Get safe area dimensions (accounting for notches, etc.)
   */
  getSafeAreaDimensions(): LayoutDimensions {
    return this.currentDimensions
  }

  /**
   * Subscribe to layout changes
   */
  subscribe(callback: (config: LayoutConfiguration) => void): () => void {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Get CSS custom properties for current layout
   */
  getCSSCustomProperties(): Record<string, string> {
    const config = this.getCurrentConfiguration()
    const grid = this.getGridLayout()

    return {
      '--container-max-width': `${config.containerMaxWidth}px`,
      '--grid-columns': `${grid.columns}`,
      '--grid-gap': `${grid.gap}px`,
      '--card-width': `${grid.cardWidth}px`,
      '--card-height': `${grid.cardHeight}px`,
      '--button-size': `${config.buttonSize}px`,
      '--font-size-sm': `${config.fontSize.small}px`,
      '--font-size-md': `${config.fontSize.medium}px`,
      '--font-size-lg': `${config.fontSize.large}px`,
      '--font-size-xl': `${config.fontSize.xlarge}px`,
      '--spacing-xs': `${config.spacing.xs}px`,
      '--spacing-sm': `${config.spacing.sm}px`,
      '--spacing-md': `${config.spacing.md}px`,
      '--spacing-lg': `${config.spacing.lg}px`,
      '--spacing-xl': `${config.spacing.xl}px`,
      '--border-radius-sm': `${config.borderRadius.small}px`,
      '--border-radius-md': `${config.borderRadius.medium}px`,
      '--border-radius-lg': `${config.borderRadius.large}px`,
      '--safe-area-top': `${this.currentDimensions.safeAreaInsets.top}px`,
      '--safe-area-right': `${this.currentDimensions.safeAreaInsets.right}px`,
      '--safe-area-bottom': `${this.currentDimensions.safeAreaInsets.bottom}px`,
      '--safe-area-left': `${this.currentDimensions.safeAreaInsets.left}px`
    }
  }

  // Private methods
  private calculateDimensions(): LayoutDimensions {
    const width = window.innerWidth
    const height = window.innerHeight
    
    // Calculate safe area insets
    const safeAreaInsets = this.calculateSafeAreaInsets()
    
    return {
      width,
      height,
      availableWidth: width - safeAreaInsets.left - safeAreaInsets.right,
      availableHeight: height - safeAreaInsets.top - safeAreaInsets.bottom,
      safeAreaInsets
    }
  }

  private calculateSafeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
    // Use CSS env() values if available
    const computedStyle = getComputedStyle(document.documentElement)
    
    return {
      top: this.parseCSSValue(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
      right: this.parseCSSValue(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
      bottom: this.parseCSSValue(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
      left: this.parseCSSValue(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0
    }
  }

  private parseCSSValue(value: string): number {
    const match = value.match(/(\d+(?:\.\d+)?)px/)
    return match ? parseFloat(match[1]) : 0
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize()
      })
      this.resizeObserver.observe(document.documentElement)
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', () => this.handleResize())
    }
  }

  private handleResize(): void {
    const oldDimensions = this.currentDimensions
    this.currentDimensions = this.calculateDimensions()

    // Only notify if dimensions actually changed
    if (
      oldDimensions.width !== this.currentDimensions.width ||
      oldDimensions.height !== this.currentDimensions.height
    ) {
      const newConfig = this.getCurrentConfiguration()
      this.listeners.forEach(callback => callback(newConfig))
    }
  }

  private getMobileConfiguration(): LayoutConfiguration {
    return {
      containerMaxWidth: 480,
      gridColumns: 2,
      gridGap: 12,
      buttonSize: 48,
      fontSize: {
        small: 12,
        medium: 14,
        large: 18,
        xlarge: 24
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      },
      borderRadius: {
        small: 4,
        medium: 8,
        large: 12
      }
    }
  }

  private getTabletConfiguration(): LayoutConfiguration {
    return {
      containerMaxWidth: 768,
      gridColumns: 3,
      gridGap: 16,
      buttonSize: 52,
      fontSize: {
        small: 14,
        medium: 16,
        large: 20,
        xlarge: 28
      },
      spacing: {
        xs: 6,
        sm: 12,
        md: 20,
        lg: 32,
        xl: 40
      },
      borderRadius: {
        small: 6,
        medium: 10,
        large: 16
      }
    }
  }

  private getDesktopConfiguration(): LayoutConfiguration {
    return {
      containerMaxWidth: 1024,
      gridColumns: 4,
      gridGap: 20,
      buttonSize: 44,
      fontSize: {
        small: 14,
        medium: 16,
        large: 20,
        xlarge: 32
      },
      spacing: {
        xs: 8,
        sm: 16,
        md: 24,
        lg: 40,
        xl: 48
      },
      borderRadius: {
        small: 6,
        medium: 12,
        large: 20
      }
    }
  }

  private getWideConfiguration(): LayoutConfiguration {
    return {
      containerMaxWidth: 1440,
      gridColumns: 5,
      gridGap: 24,
      buttonSize: 48,
      fontSize: {
        small: 16,
        medium: 18,
        large: 24,
        xlarge: 36
      },
      spacing: {
        xs: 8,
        sm: 16,
        md: 32,
        lg: 48,
        xl: 64
      },
      borderRadius: {
        small: 8,
        medium: 16,
        large: 24
      }
    }
  }
}

// Export singleton instance
export const responsiveLayout = ResponsiveLayout.getInstance()