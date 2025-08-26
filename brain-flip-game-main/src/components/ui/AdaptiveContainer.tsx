/**
 * Adaptive Container Component
 * Automatically adapts layout and styling based on device capabilities
 */

import React, { ReactNode } from 'react'
import { useAdaptiveUI, useBreakpoint } from '../../hooks/useAdaptiveUI'

interface AdaptiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: boolean
  padding?: boolean
  center?: boolean
  style?: React.CSSProperties
}

export function AdaptiveContainer({
  children,
  className = '',
  maxWidth = true,
  padding = true,
  center = true,
  style = {}
}: AdaptiveContainerProps) {
  const { uiConfig, layoutConfig } = useAdaptiveUI()
  const { deviceType } = useBreakpoint()

  const containerStyles: React.CSSProperties = {
    width: '100%',
    ...(maxWidth && { maxWidth: `${layoutConfig.containerMaxWidth}px` }),
    ...(center && { margin: '0 auto' }),
    ...(padding && {
      paddingLeft: `var(--spacing-${deviceType === 'mobile' ? 'sm' : 'md'})`,
      paddingRight: `var(--spacing-${deviceType === 'mobile' ? 'sm' : 'md'})`
    }),
    ...style
  }

  const containerClasses = [
    'adaptive-container',
    `device-${deviceType}`,
    `complexity-${uiConfig.complexity.level}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses} style={containerStyles}>
      {children}
    </div>
  )
}

/**
 * Adaptive Grid Component
 * Creates responsive grids that adapt to device capabilities
 */
interface AdaptiveGridProps {
  children: ReactNode
  className?: string
  minItemWidth?: number
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  style?: React.CSSProperties
}

export function AdaptiveGrid({
  children,
  className = '',
  minItemWidth,
  gap = 'md',
  style = {}
}: AdaptiveGridProps) {
  const { layoutConfig } = useAdaptiveUI()
  const { deviceType } = useBreakpoint()

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gap: `var(--spacing-${gap})`,
    gridTemplateColumns: minItemWidth 
      ? `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`
      : `repeat(${layoutConfig.gridColumns}, 1fr)`,
    width: '100%',
    ...style
  }

  const gridClasses = [
    'adaptive-grid',
    `device-${deviceType}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={gridClasses} style={gridStyles}>
      {children}
    </div>
  )
}

/**
 * Adaptive Button Component
 * Buttons that adapt size and interaction based on device
 */
interface AdaptiveButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large' | 'auto'
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export function AdaptiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'auto',
  disabled = false,
  className = '',
  style = {}
}: AdaptiveButtonProps) {
  const { uiConfig, layoutConfig } = useAdaptiveUI()
  const { deviceType } = useBreakpoint()

  const getButtonSize = () => {
    if (size !== 'auto') return size
    return layoutConfig.buttonSize > 48 ? 'large' : 'medium'
  }

  const buttonSize = getButtonSize()
  const buttonStyles: React.CSSProperties = {
    minHeight: `${layoutConfig.buttonSize}px`,
    padding: deviceType === 'mobile' 
      ? 'var(--spacing-sm) var(--spacing-md)'
      : 'var(--spacing-md) var(--spacing-lg)',
    borderRadius: `var(--border-radius-${buttonSize === 'large' ? 'lg' : 'md'})`,
    fontSize: `var(--font-size-${buttonSize === 'large' ? 'lg' : 'md'})`,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    touchAction: 'manipulation', // Prevents zoom on double-tap
    ...style
  }

  const buttonClasses = [
    'adaptive-button',
    `variant-${variant}`,
    `size-${buttonSize}`,
    `device-${deviceType}`,
    disabled && 'disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={buttonClasses}
      style={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}

/**
 * Adaptive Text Component
 * Text that scales appropriately for device and accessibility needs
 */
interface AdaptiveTextProps {
  children: ReactNode
  variant?: 'body' | 'caption' | 'heading' | 'title'
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'auto'
  weight?: 'normal' | 'medium' | 'bold'
  color?: string
  className?: string
  style?: React.CSSProperties
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function AdaptiveText({
  children,
  variant = 'body',
  size = 'auto',
  weight = 'normal',
  color,
  className = '',
  style = {},
  as: Component = 'p'
}: AdaptiveTextProps) {
  const { uiConfig } = useAdaptiveUI()
  const { deviceType } = useBreakpoint()

  const getTextSize = () => {
    if (size !== 'auto') return size
    
    switch (variant) {
      case 'caption': return 'small'
      case 'body': return 'medium'
      case 'heading': return 'large'
      case 'title': return 'xlarge'
      default: return 'medium'
    }
  }

  const textSize = getTextSize()
  const textStyles: React.CSSProperties = {
    fontSize: `var(--font-size-${textSize})`,
    fontWeight: weight === 'normal' ? 400 : weight === 'medium' ? 500 : 700,
    lineHeight: variant === 'caption' ? 1.3 : variant === 'body' ? 1.5 : 1.2,
    margin: 0,
    ...(color && { color }),
    ...style
  }

  const textClasses = [
    'adaptive-text',
    `variant-${variant}`,
    `size-${textSize}`,
    `weight-${weight}`,
    `device-${deviceType}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <Component className={textClasses} style={textStyles}>
      {children}
    </Component>
  )
}

/**
 * Adaptive Card Component
 * Cards that adapt their layout and spacing based on device
 */
interface AdaptiveCardProps {
  children: ReactNode
  padding?: 'none' | 'small' | 'medium' | 'large' | 'auto'
  elevation?: 'none' | 'low' | 'medium' | 'high'
  interactive?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function AdaptiveCard({
  children,
  padding = 'auto',
  elevation = 'low',
  interactive = false,
  onClick,
  className = '',
  style = {}
}: AdaptiveCardProps) {
  const { deviceType } = useBreakpoint()

  const getPadding = () => {
    if (padding !== 'auto') return padding
    return deviceType === 'mobile' ? 'medium' : 'large'
  }

  const cardPadding = getPadding()
  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--card-background, #ffffff)',
    borderRadius: 'var(--border-radius-lg)',
    padding: `var(--spacing-${cardPadding})`,
    boxShadow: elevation === 'none' ? 'none' : 
               elevation === 'low' ? '0 1px 3px rgba(0,0,0,0.1)' :
               elevation === 'medium' ? '0 4px 6px rgba(0,0,0,0.1)' :
               '0 10px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    cursor: interactive ? 'pointer' : 'default',
    ...style
  }

  const cardClasses = [
    'adaptive-card',
    `padding-${cardPadding}`,
    `elevation-${elevation}`,
    `device-${deviceType}`,
    interactive && 'interactive',
    className
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    if (interactive && onClick) {
      onClick()
    }
  }

  return (
    <div 
      className={cardClasses} 
      style={cardStyles}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  )
}