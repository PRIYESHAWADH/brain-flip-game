export default function Footer() {
	return (
		<footer className="glass-card mx-4 mb-4 mt-8 px-6 py-4 text-center">
			<p className="text-text-muted text-sm">
				&copy; {new Date().getFullYear()} Brain Flip. Made with ❤️ for brain training enthusiasts.
			</p>
			<p className="text-text-muted text-xs mt-2">
				Challenge your mind • Think backwards • Master the opposite
			</p>
		</footer>
	);
}
