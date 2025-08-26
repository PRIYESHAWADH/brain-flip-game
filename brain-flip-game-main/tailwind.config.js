module.exports = {
	content: [
		'./src/**/*.{js,ts,jsx,tsx}',
		'./src/app/**/*.{js,ts,jsx,tsx}',
		'./src/components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				'orbitron': ['Orbitron', 'monospace'],
				'inter': ['Inter', 'sans-serif'],
			},
			animation: {
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'screen-shake': 'screen-shake 0.5s ease-in-out',
				'bounce-in': 'bounceIn 0.6s ease-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'rotate': 'rotate 3s linear infinite',
				'particle-bounce': 'particle-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'particle-shake': 'particle-shake 0.5s ease-out',
			},
			boxShadow: {
				'neon-green': '0 0 20px #00FF41',
				'neon-blue': '0 0 20px #0080FF',
				'neon-pink': '0 0 20px #FF0080',
				'neon-yellow': '0 0 20px #FFFF00',
				'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
				'glow-lg': '0 0 30px rgba(99, 102, 241, 0.4)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			colors: {
				// Neon colors
				'neon-green': '#00FF41',
				'neon-blue': '#0080FF',
				'neon-pink': '#FF0080',
				'neon-yellow': '#FFFF00',
				'neon-cyan': '#00FFFF',
				'neon-purple': '#8000FF',
				
				// Brand colors
				'brain-primary': '#6366f1',
				'brain-secondary': '#8b5cf6',
				'brain-accent': '#06b6d4',
				'brain-success': '#10b981',
				'brain-warning': '#f59e0b',
				'brain-danger': '#ef4444',
				
				// Background colors
				'bg-primary': '#0f172a',
				'bg-secondary': '#1e293b',
				'bg-tertiary': '#334155',
				'bg-card': 'rgba(30, 41, 59, 0.8)',
				'bg-glass': 'rgba(255, 255, 255, 0.05)',
				'bg-overlay': 'rgba(0, 0, 0, 0.8)',
				
				// Text colors
				'text-primary': '#f8fafc',
				'text-secondary': '#cbd5e1',
				'text-muted': '#64748b',
				'text-inverse': '#0f172a',
				
				// Border colors
				'border-primary': 'rgba(255, 255, 255, 0.1)',
				'border-secondary': 'rgba(255, 255, 255, 0.05)',
			},
			keyframes: {
				'neon-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px currentColor' },
					'50%': { boxShadow: '0 0 40px currentColor, 0 0 60px currentColor' },
				},
				'screen-shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-5px) translateY(-5px)' },
					'75%': { transform: 'translateX(5px) translateY(5px)' },
				},
				'rotate': {
					'to': { transform: 'rotate(360deg)' }
				},
				'particle-bounce': {
					'0%': { transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0' },
					'50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: '1' },
					'100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0' },
				},
				'particle-shake': {
					'0%, 100%': { transform: 'translate(-50%, -50%) translateX(0)' },
					'25%': { transform: 'translate(-50%, -50%) translateX(-10px)' },
					'75%': { transform: 'translate(-50%, -50%) translateX(10px)' },
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};