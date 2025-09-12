import React from 'react';
import { cn } from '@/lib/utils';

interface NeuSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const NeuSwitch: React.FC<NeuSwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <label className="neu-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
};
