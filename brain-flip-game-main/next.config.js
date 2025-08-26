/** @type {import('next').NextConfig} */
const path = require('path');
const isProd = process.env.NODE_ENV === 'production';
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: !isProd, // Disable PWA in dev
	register: true,
	skipWaiting: true,
});

module.exports = withPWA({
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['supabase.co'],
		formats: ['image/webp', 'image/avif'],
	},
	compress: true,
	poweredByHeader: false,
	generateEtags: false,
	webpack: (config, { dev, isServer }) => {
		// Resolve path alias '@' to the 'src' directory for runtime
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			'@': path.resolve(__dirname, 'src'),
		};
		config.module.rules.push({
			test: /\.(wav|mp3|ogg)$/,
			use: {
				loader: 'file-loader',
				options: {
					publicPath: '/_next/static/audio/',
					outputPath: 'static/audio/',
				},
			},
		});
		return config;
	},
	headers: async () => [
		{
			source: '/(.*)',
			headers: [
				{ key: 'X-Content-Type-Options', value: 'nosniff' },
				{ key: 'X-Frame-Options', value: 'DENY' },
				{ key: 'X-XSS-Protection', value: '1; mode=block' },
			],
		},
	],
});
