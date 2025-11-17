import { AppIcons, IconSizes } from './icons';

/**
 * Centralized Icon Component
 *
 * Usage:
 *   <Icon name="speakingLab" size="lg" />
 *   <Icon name="mic" className="custom-class" />
 *
 * Props:
 *   - name: keyof AppIcons (required)
 *   - size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | number (optional, default: 'base')
 *   - className: string (optional)
 *   - ...rest: any other props passed to the Lucide icon
 */
export function Icon({ name, size = 'base', className = '', ...rest }) {
  const LucideIcon = AppIcons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in AppIcons`);
    return null;
  }

  // Convert size to pixel value
  const pixelSize = typeof size === 'number'
    ? size
    : IconSizes[size] || IconSizes.base;

  return (
    <LucideIcon
      size={pixelSize}
      className={className}
      {...rest}
    />
  );
}

export default Icon;
