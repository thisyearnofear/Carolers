import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xs': '0.375rem',
				xs: '0.5rem',
				'card-sm': '1rem',
				'card-lg': '1.5rem',
				'card-xl': '2rem',
			},
			fontFamily: {
				display: ['var(--font-display)', 'cursive'],
				sans: ['var(--font-sans)', 'sans-serif'],
			},
			spacing: {
				xs: '0.25rem',
				sm: '0.5rem',
				md: '1rem',
				lg: '1.5rem',
				xl: '2rem',
				'2xl': '3rem',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			boxShadow: {
				'sm-lift': '0 4px 12px rgba(0, 0, 0, 0.08)',
				'md-lift': '0 8px 24px rgba(0, 0, 0, 0.12)',
				'lg-lift': '0 12px 32px rgba(0, 0, 0, 0.15)',
				'glow': '0 0 20px rgba(196, 30, 58, 0.3)',
			},
			keyframes: {
				celebrate: {
					'0%': { transform: 'scale(0.8) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'scale(1.2) rotate(5deg)', opacity: '0' },
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(196, 30, 58, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(196, 30, 58, 0.6)' },
				},
			},
			animation: {
				'celebrate': 'celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;