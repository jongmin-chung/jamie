---
title: "확장 가능한 디자인 시스템과 컴포넌트 라이브러리 구축"
description: "일관된 사용자 경험을 위한 체계적인 디자인 시스템 구축 방법과 카카오페이 디자인 시스템의 실제 구현 사례를 소개합니다."
publishedAt: "2024-12-23"
category: "Design"
tags: ["디자인시스템", "컴포넌트라이브러리", "UI", "일관성", "확장성"]
author: "시스템디자이너"
featured: true
---

# 확장 가능한 디자인 시스템과 컴포넌트 라이브러리 구축

일관된 사용자 경험과 효율적인 개발 프로세스를 위해 디자인 시스템은 필수적입니다. 카카오페이에서 다양한 플랫폼과 서비스를 아우르는 통합 디자인 시스템을 구축한 경험을 바탕으로, 확장 가능한 디자인 시스템 구축 방법을 상세히 소개합니다.

## 디자인 시스템 아키텍처

### 1. 토큰 기반 디자인 시스템
```json
{
  "colors": {
    "brand": {
      "primary": {
        "50": "#FEF7E0",
        "100": "#FEECC2",
        "200": "#FED685",
        "300": "#FEC149",
        "400": "#FEA21C",
        "500": "#FE8500",
        "600": "#E06900",
        "700": "#B85400",
        "800": "#8F4100",
        "900": "#663000"
      },
      "secondary": {
        "50": "#F0F9FF",
        "100": "#E0F2FE",
        "200": "#BAE6FD",
        "300": "#7DD3FC",
        "400": "#38BDF8",
        "500": "#0EA5E9",
        "600": "#0284C7",
        "700": "#0369A1",
        "800": "#075985",
        "900": "#0C4A6E"
      }
    },
    "semantic": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#3B82F6"
    },
    "neutral": {
      "50": "#F9FAFB",
      "100": "#F3F4F6",
      "200": "#E5E7EB",
      "300": "#D1D5DB",
      "400": "#9CA3AF",
      "500": "#6B7280",
      "600": "#4B5563",
      "700": "#374151",
      "800": "#1F2937",
      "900": "#111827"
    }
  },
  "typography": {
    "fontFamilies": {
      "sans": ["Pretendard", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      "mono": ["JetBrains Mono", "Monaco", "Consolas", "monospace"]
    },
    "fontSizes": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "30px",
      "4xl": "36px",
      "5xl": "48px"
    },
    "fontWeights": {
      "thin": 100,
      "light": 300,
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800,
      "black": 900
    },
    "lineHeights": {
      "tight": 1.25,
      "snug": 1.375,
      "normal": 1.5,
      "relaxed": 1.625,
      "loose": 2
    }
  },
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px"
  },
  "borderRadius": {
    "none": "0px",
    "sm": "4px",
    "base": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "20px",
    "2xl": "24px",
    "full": "9999px"
  },
  "shadows": {
    "xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "base": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "md": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "lg": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
  }
}
```

### 2. CSS 커스텀 프로퍼티 활용
```css
/* design-tokens.css */
:root {
  /* Colors */
  --color-brand-primary-500: #FE8500;
  --color-brand-primary-600: #E06900;
  --color-brand-secondary-500: #0EA5E9;
  
  --color-semantic-success: #10B981;
  --color-semantic-warning: #F59E0B;
  --color-semantic-error: #EF4444;
  --color-semantic-info: #3B82F6;
  
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-500: #6B7280;
  --color-neutral-900: #111827;
  
  /* Typography */
  --font-family-sans: 'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  
  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  
  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-base: 8px;
  --border-radius-lg: 16px;
  --border-radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  
  /* Z-indexes */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}

/* Dark mode overrides */
[data-theme="dark"] {
  --color-neutral-50: #1F2937;
  --color-neutral-100: #374151;
  --color-neutral-500: #9CA3AF;
  --color-neutral-900: #F9FAFB;
}

/* RTL support */
[dir="rtl"] {
  --text-align-start: right;
  --text-align-end: left;
}

[dir="ltr"] {
  --text-align-start: left;
  --text-align-end: right;
}
```

## 컴포넌트 라이브러리 구현

### 1. Button 컴포넌트 시스템
```tsx
// Button.tsx - 확장 가능한 버튼 컴포넌트
import React, { forwardRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// Button variants 정의
const buttonVariants = cva(
  // 기본 스타일
  [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'border border-transparent',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'active:scale-95'
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-primary-500 text-white shadow-sm',
          'hover:bg-brand-primary-600',
          'focus-visible:ring-brand-primary-500'
        ],
        secondary: [
          'bg-brand-secondary-500 text-white shadow-sm',
          'hover:bg-brand-secondary-600',
          'focus-visible:ring-brand-secondary-500'
        ],
        outline: [
          'border-neutral-300 bg-transparent text-neutral-700',
          'hover:bg-neutral-50 hover:text-neutral-900',
          'focus-visible:ring-neutral-500'
        ],
        ghost: [
          'bg-transparent text-neutral-700',
          'hover:bg-neutral-100 hover:text-neutral-900',
          'focus-visible:ring-neutral-500'
        ],
        danger: [
          'bg-semantic-error text-white shadow-sm',
          'hover:bg-red-600',
          'focus-visible:ring-semantic-error'
        ],
        success: [
          'bg-semantic-success text-white shadow-sm',
          'hover:bg-green-600',
          'focus-visible:ring-semantic-success'
        ]
      },
      size: {
        xs: 'h-7 px-2 text-xs rounded-sm',
        sm: 'h-8 px-3 text-sm rounded-base',
        base: 'h-10 px-4 text-base rounded-base',
        lg: 'h-12 px-6 text-lg rounded-lg',
        xl: 'h-14 px-8 text-xl rounded-lg'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base'
    }
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    leftIcon,
    rightIcon,
    loading,
    disabled,
    children,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size} />
            <span className="ml-2">처리 중...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading Spinner 컴포넌트
const LoadingSpinner = ({ size }: { size?: string }) => {
  const sizeClass = size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <svg
      className={cn('animate-spin', sizeClass)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export { Button, buttonVariants };
export type { ButtonProps };
```

### 2. Input 컴포넌트 시스템
```tsx
// Input.tsx - 입력 컴포넌트 시스템
import React, { forwardRef, ReactNode, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  [
    'flex w-full rounded-base border bg-white px-3 py-2',
    'text-sm ring-offset-white file:border-0 file:bg-transparent',
    'file:text-sm file:font-medium placeholder:text-neutral-400',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-colors duration-200'
  ],
  {
    variants: {
      variant: {
        default: [
          'border-neutral-300',
          'focus-visible:ring-brand-primary-500'
        ],
        error: [
          'border-semantic-error text-semantic-error',
          'focus-visible:ring-semantic-error'
        ],
        success: [
          'border-semantic-success',
          'focus-visible:ring-semantic-success'
        ]
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        base: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'base'
    }
  }
);

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helpText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    type,
    variant,
    size,
    label,
    helpText,
    errorMessage,
    leftIcon,
    rightIcon,
    showPasswordToggle,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    
    // 에러가 있으면 variant를 error로 설정
    const finalVariant = errorMessage ? 'error' : variant;
    
    // 비밀번호 타입이고 toggle이 활성화된 경우 type 조정
    const inputType = 
      type === 'password' && showPasswordToggle && showPassword 
        ? 'text' 
        : type;
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
            {props.required && (
              <span className="text-semantic-error ml-1">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={inputType}
            className={cn(
              inputVariants({ variant: finalVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle) && 'pr-10',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {(helpText || errorMessage) && (
          <p className={cn(
            'text-xs mt-1',
            errorMessage ? 'text-semantic-error' : 'text-neutral-500'
          )}>
            {errorMessage || helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// 아이콘 컴포넌트들
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <path d="M1 1l22 22"/>
  </svg>
);

export { Input, inputVariants };
export type { InputProps };
```

### 3. 복합 컴포넌트 패턴
```tsx
// Card.tsx - 복합 컴포넌트 패턴을 활용한 카드 컴포넌트
import React, { createContext, useContext, forwardRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

// Card Context
const CardContext = createContext<{ variant?: string }>({});

const cardVariants = cva(
  'rounded-lg border bg-white text-neutral-950 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-neutral-200',
        elevated: 'border-neutral-200 shadow-lg',
        outlined: 'border-neutral-300 shadow-none',
        ghost: 'border-transparent shadow-none'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, children, ...props }, ref) => {
    return (
      <CardContext.Provider value={{ variant }}>
        <div
          ref={ref}
          className={cn(
            cardVariants({ variant }),
            hoverable && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);
Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
        {...props}
      >
        {(title || subtitle || actions) && (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold leading-none tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="ml-4">
                {actions}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

// Card Content
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

// Card Footer
const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
```

## 테마 및 다크 모드 지원

### 1. 테마 시스템 구현
```tsx
// theme-provider.tsx - 테마 관리 시스템
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.removeAttribute('data-theme');

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.setAttribute(attribute, systemTheme);
      return;
    }

    root.setAttribute(attribute, theme);
  }, [theme, attribute, enableSystem]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

// theme-toggle.tsx - 테마 전환 컴포넌트
import React from 'react';
import { useTheme } from './theme-provider';
import { Button } from './button';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon />;
      case 'dark':
        return <MoonIcon />;
      default:
        return <SystemIcon />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return '라이트 모드';
      case 'dark':
        return '다크 모드';
      default:
        return '시스템 설정';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={`현재 ${getLabel()}, 클릭하여 테마 변경`}
    >
      {getIcon()}
    </Button>
  );
};

// 아이콘 컴포넌트들
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SystemIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M10 4v16M14 4v16"/>
  </svg>
);

export { ThemeToggle };
```

### 2. 다크 모드 CSS 토큰 확장
```css
/* dark-theme.css - 다크 모드 확장 */
[data-theme="dark"] {
  /* Background colors */
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-surface-elevated: #334155;
  
  /* Text colors */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #64748B;
  
  /* Border colors */
  --color-border: #334155;
  --color-border-muted: #1E293B;
  
  /* Brand colors (adjusted for dark mode) */
  --color-brand-primary-500: #FEA21C;
  --color-brand-primary-600: #FB923C;
  
  /* Semantic colors (adjusted) */
  --color-semantic-success: #22C55E;
  --color-semantic-warning: #FBBF24;
  --color-semantic-error: #F87171;
  --color-semantic-info: #60A5FA;
  
  /* Shadows (adjusted for dark mode) */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
}

/* Component-specific dark mode styles */
[data-theme="dark"] .card {
  --color-card-background: var(--color-surface);
  --color-card-border: var(--color-border);
}

[data-theme="dark"] .input {
  --color-input-background: var(--color-surface);
  --color-input-border: var(--color-border);
  --color-input-text: var(--color-text-primary);
}

[data-theme="dark"] .button-outline {
  --color-button-border: var(--color-border);
  --color-button-text: var(--color-text-primary);
  --color-button-hover-bg: var(--color-surface-elevated);
}

/* Smooth transitions for theme changes */
* {
  transition: 
    background-color 200ms ease,
    border-color 200ms ease,
    color 200ms ease,
    fill 200ms ease,
    stroke 200ms ease,
    box-shadow 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
```

## 접근성 및 국제화

### 1. 접근성 향상된 컴포넌트
```tsx
// accessible-components.tsx - 접근성을 고려한 컴포넌트들
import React, { forwardRef, useId } from 'react';

// 접근성 향상된 모달 컴포넌트
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // 포커스 트랩
      const modal = document.querySelector('[role="dialog"]');
      const focusableElements = modal?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* 백드롭 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 모달 내용 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            'bg-white rounded-lg shadow-xl max-h-full overflow-y-auto',
            {
              'max-w-sm': size === 'sm',
              'max-w-md': size === 'md',
              'max-w-lg': size === 'lg',
              'max-w-4xl': size === 'xl',
            }
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="모달 닫기"
            >
              <CloseIcon />
            </button>
          </div>
          
          {/* 내용 */}
          <div id={descriptionId} className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// 접근성 향상된 탭 컴포넌트
interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

const TabsContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
}>({
  value: '',
  setValue: () => {},
  orientation: 'horizontal'
});

export const Tabs = ({ defaultValue, children, orientation = 'horizontal' }: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ value, setValue, orientation }}>
      <div className={orientation === 'vertical' ? 'flex' : 'block'}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { orientation } = React.useContext(TabsContext);
  
  return (
    <div
      className={cn(
        'flex bg-neutral-100 rounded-base p-1',
        orientation === 'vertical' ? 'flex-col mr-4' : 'flex-row',
        className
      )}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const TabsTrigger = ({ value, children, disabled }: TabsTriggerProps) => {
  const { value: selectedValue, setValue } = React.useContext(TabsContext);
  const isSelected = value === selectedValue;
  
  return (
    <button
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500',
        isSelected
          ? 'bg-white text-neutral-900 shadow-sm'
          : 'text-neutral-600 hover:text-neutral-900',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => !disabled && setValue(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          !disabled && setValue(value);
        }
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const { value: selectedValue } = React.useContext(TabsContext);
  
  if (value !== selectedValue) return null;
  
  return (
    <div role="tabpanel" tabIndex={0} className="mt-4 focus:outline-none">
      {children}
    </div>
  );
};
```

### 2. 국제화 지원
```tsx
// i18n-provider.tsx - 국제화 지원
import React, { createContext, useContext, useState } from 'react';

type Locale = 'ko' | 'en' | 'ja' | 'zh';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 번역 데이터
const translations = {
  ko: {
    'button.save': '저장',
    'button.cancel': '취소',
    'button.delete': '삭제',
    'button.edit': '수정',
    'form.required': '필수 입력 항목입니다',
    'form.email.invalid': '올바른 이메일 주소를 입력해주세요',
    'amount.currency': '{amount}원',
    'date.format': 'YYYY년 MM월 DD일'
  },
  en: {
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'form.required': 'This field is required',
    'form.email.invalid': 'Please enter a valid email address',
    'amount.currency': '${amount}',
    'date.format': 'MM/DD/YYYY'
  },
  ja: {
    'button.save': '保存',
    'button.cancel': 'キャンセル',
    'button.delete': '削除',
    'button.edit': '編集',
    'form.required': 'この項目は必須です',
    'form.email.invalid': '有効なメールアドレスを入力してください',
    'amount.currency': '{amount}円',
    'date.format': 'YYYY年MM月DD日'
  }
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('ko');
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[locale][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  };
  
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : locale).format(num);
  };
  
  const formatCurrency = (amount: number, currency = 'KRW'): string => {
    const currencyMap = {
      ko: 'KRW',
      en: 'USD',
      ja: 'JPY',
      zh: 'CNY'
    };
    
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : locale, {
      style: 'currency',
      currency: currency || currencyMap[locale]
    }).format(amount);
  };
  
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  };
  
  return (
    <I18nContext.Provider value={{
      locale,
      setLocale,
      t,
      formatNumber,
      formatCurrency,
      formatDate
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// 번역된 컴포넌트 예제
export const SaveButton = () => {
  const { t } = useI18n();
  
  return (
    <Button>
      {t('button.save')}
    </Button>
  );
};

export const CurrencyDisplay = ({ amount }: { amount: number }) => {
  const { formatCurrency } = useI18n();
  
  return (
    <span className="font-medium">
      {formatCurrency(amount)}
    </span>
  );
};
```

확장 가능한 디자인 시스템은 제품의 일관성과 개발 효율성을 크게 향상시킵니다. 토큰 기반의 체계적인 접근, 컴포넌트 구성의 유연성, 접근성 고려, 그리고 국제화 지원을 통해 다양한 요구사항에 대응할 수 있는 견고한 시스템을 구축할 수 있습니다.