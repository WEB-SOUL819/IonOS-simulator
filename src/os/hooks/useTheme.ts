import { useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  wallpaper: string;
  accent: string;
  highlight: string;
  text: string;
  mode: 'dark' | 'light';
}

export const THEMES: Theme[] = [
  { 
    id: 'default', 
    name: 'Default', 
    wallpaper: 'bg-zinc-900', 
    accent: 'text-indigo-400', 
    highlight: 'bg-zinc-700',
    text: 'text-white',
    mode: 'dark'
  },
  { 
    id: 'nature', 
    name: 'Nature', 
    wallpaper: 'bg-emerald-950', 
    accent: 'text-emerald-400', 
    highlight: 'bg-emerald-900',
    text: 'text-emerald-50',
    mode: 'dark'
  },
  { 
    id: 'ocean', 
    name: 'Ocean', 
    wallpaper: 'bg-blue-950', 
    accent: 'text-blue-400', 
    highlight: 'bg-blue-900',
    text: 'text-blue-50',
    mode: 'dark'
  },
  { 
    id: 'sunset', 
    name: 'Sunset', 
    wallpaper: 'bg-orange-950', 
    accent: 'text-orange-400', 
    highlight: 'bg-orange-900',
    text: 'text-orange-50',
    mode: 'dark'
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    wallpaper: 'bg-purple-950', 
    accent: 'text-purple-400', 
    highlight: 'bg-purple-900',
    text: 'text-purple-50',
    mode: 'dark'
  },
  { 
    id: 'matrix', 
    name: 'Matrix', 
    wallpaper: 'bg-black', 
    accent: 'text-green-500', 
    highlight: 'bg-green-900',
    text: 'text-green-400',
    mode: 'dark'
  },
  {
    id: 'light',
    name: 'Light',
    wallpaper: 'bg-zinc-100',
    accent: 'text-indigo-600',
    highlight: 'bg-zinc-200',
    text: 'text-zinc-900',
    mode: 'light'
  }
];

export function useTheme() {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('ionos_theme') || 'default');
  const [customAccent, setCustomAccent] = useState(() => localStorage.getItem('ionos_accent') || '');

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeId(localStorage.getItem('ionos_theme') || 'default');
      setCustomAccent(localStorage.getItem('ionos_accent') || '');
    };
    
    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    
    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  const baseTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  
  const theme: Theme = {
    ...baseTheme,
    accent: customAccent || baseTheme.accent,
  };
  
  const setTheme = (id: string) => {
    localStorage.setItem('ionos_theme', id);
    // Reset custom accent when changing base theme, or keep it? Let's keep it optional.
    // Actually, usually changing theme resets overrides.
    localStorage.removeItem('ionos_accent'); 
    setThemeId(id);
    setCustomAccent('');
    window.dispatchEvent(new Event('theme-change'));
  };

  const setAccent = (colorClass: string) => {
    localStorage.setItem('ionos_accent', colorClass);
    setCustomAccent(colorClass);
    window.dispatchEvent(new Event('theme-change'));
  };

  return { theme, setTheme, setAccent, themes: THEMES };
}
