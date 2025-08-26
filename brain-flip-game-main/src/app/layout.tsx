import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
	title: 'Brain Flip - The Opposite Game | Addictive Brain Training',
	description: 'Can you think backwards? Test your reflexes in the most challenging opposite game ever created. Play Brain Flip now!',
	keywords: 'brain training, puzzle game, reaction time, opposite game, brain flip',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
	openGraph: {
		title: 'Brain Flip - The Opposite Game',
		description: 'The most addictive brain training game ever!',
		url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
		siteName: 'Brain Flip',
		images: ['/og-image.png'],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Brain Flip - The Opposite Game',
		description: 'Can you think backwards? Test your brain now!',
		images: ['/twitter-image.png'],
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
				<meta name="theme-color" content="#00FF41" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/icon-192x192.png" />
			</head>
			<body className="min-h-screen antialiased">
				{/* Accessibility skip link */}
				<a href="#main-content" className="sr-only focus:not-sr-only absolute top-0 left-0 bg-neon-yellow text-text-inverse p-2 z-50 rounded">Skip to main content</a>
				{/* Header */}
				<header>
					<Header />
				</header>
				<main id="main-content" tabIndex={-1} className="outline-none focus:outline-neon-yellow">
					{children}
				</main>
				
				{/* Footer */}
				<footer>
					<Footer />
				</footer>
			</body>
		</html>
	);
}
