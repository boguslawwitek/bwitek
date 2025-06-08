"use client"
import * as Lu from "react-icons/lu"  // Lucide Icons
import * as Si from "react-icons/si"  // Simple Icons

export type IconProvider = 'lu' | 'si';

const IconSets = {
  lu: Lu,
  si: Si,
} as const;

const providerPrefixes = {
  lu: 'Lu',
  si: 'Si',
} as const;

export interface IconProps {
  name: string;
  provider: IconProvider;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}

export function Icon({ 
  name,
  provider, 
  size = 24, 
  className = '',
  style,
  onClick,
  title
}: IconProps) {
  if (!name) return null;

  try {
    const iconSet = IconSets[provider];
    const prefix = providerPrefixes[provider];
    
    const iconName = name.startsWith(prefix) 
      ? name 
      : `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`;
    
    const IconComponent = (iconSet as any)[iconName];

    if (IconComponent) {
      return (
        <IconComponent 
          size={size} 
          className={className}
          style={style}
          onClick={onClick}
          title={title}
        />
      );
    }

    console.warn(`Icon "${iconName}" not found in "${provider}" provider`);
    return null;
  } catch (error) {
    console.warn(`Error loading icon "${name}" from "${provider}":`, error);
    return null;
  }
} 