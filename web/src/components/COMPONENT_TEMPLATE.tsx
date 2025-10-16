/**
 * COMPONENT TEMPLATE
 * 
 * Copy this file when creating new components.
 * It includes best practices and common patterns.
 * 
 * Design System Guide: /DESIGN_SYSTEM.md
 * Quick Reference: /TAILWIND_QUICK_REF.md
 */

import React from 'react';

/**
 * Props interface - always define props for type safety
 */
interface MyComponentProps {
  /** Primary text to display */
  title: string;
  /** Optional description */
  description?: string;
  /** Click handler */
  onAction?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
  /** Disabled state */
  disabled?: boolean;
  /** Custom className for additional styling */
  className?: string;
}

/**
 * MyComponent - Brief description of what this component does
 * 
 * @example
 * ```tsx
 * <MyComponent
 *   title="Hello World"
 *   description="This is a description"
 *   onAction={() => console.log('clicked')}
 * />
 * ```
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  onAction,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  // ============ DESIGN SYSTEM PATTERNS ============

  // Example 1: Card with content
  return (
    <div className={`card ${className}`}>
      {/* Heading */}
      <h3 className="text-heading-section mb-sm">{title}</h3>
      
      {/* Description */}
      {description && (
        <p className="text-body-secondary mb-md">{description}</p>
      )}
      
      {/* Action button */}
      <button
        onClick={onAction}
        disabled={disabled}
        className={variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
      >
        Click Me
      </button>
    </div>
  );

  // ============ OTHER COMMON PATTERNS ============

  // Example 2: Form with validation
  // return (
  //   <div className="card max-w-md mx-auto">
  //     <h2 className="text-heading-section mb-lg">{title}</h2>
  //     
  //     <form className="space-y-md">
  //       <div className="form-group">
  //         <label className="form-label">Label</label>
  //         <input type="text" className="input-field" />
  //         <p className="form-hint">Helper text here</p>
  //       </div>
  //       
  //       <button type="submit" className="btn-primary w-full">
  //         Submit
  //       </button>
  //     </form>
  //   </div>
  // );

  // Example 3: List with items
  // return (
  //   <div className="card">
  //     <h3 className="text-heading-section mb-md">{title}</h3>
  //     
  //     <div className="space-y-sm">
  //       {items.map((item) => (
  //         <div key={item.id} className="list-item">
  //           <div className="flex justify-between items-center">
  //             <div>
  //               <p className="text-body-primary">{item.name}</p>
  //               <p className="text-caption-secondary">{item.description}</p>
  //             </div>
  //             <button className="btn-ghost btn-sm">Action</button>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  // Example 4: Grid layout
  // return (
  //   <div className="container-page py-lg">
  //     <h1 className="text-heading-page mb-lg">{title}</h1>
  //     
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  //       {items.map((item) => (
  //         <div key={item.id} className="card-hover">
  //           <h3 className="text-heading-sm mb-sm">{item.title}</h3>
  //           <p className="text-body-secondary">{item.description}</p>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );

  // Example 5: Status display
  // return (
  //   <div className="card">
  //     <div className="flex items-center justify-between mb-md">
  //       <h3 className="text-heading-section">{title}</h3>
  //       <span className="badge-success">Active</span>
  //     </div>
  //     
  //     <div className="space-y-sm">
  //       <div>
  //         <p className="text-caption-secondary">Status</p>
  //         <p className="text-body-primary">Online</p>
  //       </div>
  //       <div className="divider"></div>
  //       <div>
  //         <p className="text-caption-secondary">Last Updated</p>
  //         <p className="text-body-primary">2 minutes ago</p>
  //       </div>
  //     </div>
  //   </div>
  // );
};

/**
 * QUICK TIPS:
 * 
 * 1. Always use component classes:
 *    ✅ btn-primary, card, input-field
 *    ❌ bg-blue-500 px-4 py-2 rounded
 * 
 * 2. Use semantic colors:
 *    ✅ bg-primary, text-neutral-600
 *    ❌ bg-blue-500, text-gray-600
 * 
 * 3. Use spacing scale:
 *    ✅ p-md, m-lg, gap-md
 *    ❌ p-3, m-5, gap-4
 * 
 * 4. Use text styles:
 *    ✅ text-heading, text-body, text-caption
 *    ❌ text-xl, text-base, text-xs
 * 
 * 5. Keep components small:
 *    - One component = one responsibility
 *    - Extract subcomponents when needed
 *    - Use composition over complexity
 * 
 * 6. Test responsiveness:
 *    - Always add md: and lg: breakpoints
 *    - Test on mobile, tablet, desktop
 *    - Use flex/grid for layouts
 * 
 * 7. Add proper TypeScript types:
 *    - Define Props interface
 *    - Use React.FC<Props>
 *    - Document with JSDoc comments
 */

/**
 * COMMON TAILWIND CLASSES:
 * 
 * Layout:
 *   flex, flex-col, grid, grid-cols-2
 *   items-center, justify-between, gap-md
 * 
 * Spacing:
 *   p-md, px-lg, py-sm, m-md, space-y-md
 * 
 * Typography:
 *   text-heading, text-body, text-caption
 *   font-medium, font-semibold, font-bold
 * 
 * Colors:
 *   bg-primary, text-primary, border-neutral-200
 *   bg-neutral-100, text-neutral-600
 * 
 * Components:
 *   btn-primary, btn-secondary, btn-ghost
 *   card, card-hover, input-field
 *   badge-success, badge-error
 * 
 * States:
 *   hover:bg-primary-dark, active:scale-95
 *   disabled:opacity-50, focus:ring-2
 * 
 * Responsive:
 *   md:flex-row, lg:grid-cols-3, xl:max-w-7xl
 */

export default MyComponent;

