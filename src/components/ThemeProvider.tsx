'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
})

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('dash-theme') as Theme | null
        if (stored) {
            setTheme(stored)
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        localStorage.setItem('dash-theme', theme)
    }, [theme, mounted])

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
    }

    // Prevent flash of wrong theme
    if (!mounted) {
        return <div className="min-h-screen bg-surface dark:bg-surface-dark" />
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            onClick={toggleTheme}
            className="relative group flex items-center gap-2 px-3 py-2 rounded-xl
        border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]
        hover:border-[rgba(255,255,255,0.12)]
        transition-all duration-300"
            aria-label="Toggle theme"
        >
            {/* Sun icon */}
            <svg
                className={`w-4 h-4 transition-all duration-300 ${theme === 'light'
                        ? 'text-brand-400 scale-110'
                        : 'text-slate-500 scale-90'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </svg>

            {/* Toggle track */}
            <div className="w-10 h-5 rounded-full bg-slate-700 p-0.5 transition-colors duration-300">
                <div
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${theme === 'dark'
                            ? 'translate-x-5 bg-brand-500 shadow-glow-brand'
                            : 'translate-x-0 bg-brand-400'
                        }`}
                />
            </div>

            {/* Moon icon */}
            <svg
                className={`w-4 h-4 transition-all duration-300 ${theme === 'dark'
                        ? 'text-brand-400 scale-110'
                        : 'text-slate-500 scale-90'
                    }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </svg>
        </button>
    )
}
