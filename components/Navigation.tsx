"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
	{ href: "/", label: "首页" },
	{ href: "/about", label: "关于" },
	{ href: "/blog", label: "博客" },
	{ href: "/paper-notes", label: "论文笔记" },

];

export function Navigation() {
	const pathname = usePathname();
	const router = useRouter();
	const [isScrolled, setIsScrolled] = useState(false);
	const [logoSpinning, setLogoSpinning] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const clickCountRef = useRef(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileMenuOpen]);

	const handleLogoClick = useCallback((e: React.MouseEvent) => {
		// Only trigger easter egg on same page (prevent navigation interference)
		if (pathname === "/") {
			clickCountRef.current++;
			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			if (clickCountRef.current >= 5) {
				setLogoSpinning(true);
				clickCountRef.current = 0;
				setTimeout(() => setLogoSpinning(false), 1000);

				// Games easter egg: toast + navigate
				const toast = document.createElement("div");
				toast.textContent = "🎮 发现了游戏室！";
				toast.style.cssText = `
					position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
					z-index: 9999; padding: 12px 24px; border-radius: 12px;
					background: var(--color-surface); border: 1px solid var(--color-accent);
					color: var(--color-text); font-size: 14px;
					animation: fadeInUp 0.3s ease-out;
				`;
				document.body.appendChild(toast);
				setTimeout(() => {
					toast.remove();
					router.push("/games");
				}, 1200);
			} else {
				timeoutRef.current = setTimeout(() => {
					clickCountRef.current = 0;
				}, 500);
			}
		}
	}, [pathname, router]);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
				isScrolled
					? "bg-[var(--color-background)]/90 backdrop-blur-md shadow-sm"
					: "bg-transparent"
			}`}
		>
			<nav className="max-w-5xl mx-auto px-6 py-6">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						onClick={handleLogoClick}
						className={`font-serif text-xl tracking-tight hover:text-[var(--color-accent-dark)] transition-colors ${
							logoSpinning ? "animate-logo-spin" : ""
						}`}
						style={{
							textShadow: logoSpinning ? "0 0 20px var(--color-accent)" : "none",
						}}
					>
						JohnLin
					</Link>

					<div className="flex items-center gap-8">
						<ul className="hidden md:flex items-center gap-8">
							{navItems.map((item) => {
								const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
								return (
								<li key={item.href}>
									<Link
										href={item.href}
										className={`relative text-sm tracking-wide transition-colors ${
											isActive
												? "text-[var(--color-text)]"
												: "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
										}`}
									>
										{item.label}
										{isActive && (
											<span className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--color-accent)]" />
										)}
									</Link>
								</li>
							)})}
						</ul>

						<div className="hidden md:block">
							<ThemeToggle />
						</div>

						{/* Mobile hamburger button */}
						<button
							className="md:hidden p-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
						>
							{isMobileMenuOpen ? (
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="3" y1="6" x2="21" y2="6" />
									<line x1="3" y1="12" x2="21" y2="12" />
									<line x1="3" y1="18" x2="21" y2="18" />
								</svg>
							)}
						</button>
					</div>
				</div>
			</nav>

			{/* Full-screen mobile overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 bg-[var(--color-background)] md:hidden flex flex-col">
					{/* Close button */}
					<div className="flex justify-end px-6 py-6">
						<button
							onClick={() => setIsMobileMenuOpen(false)}
							className="p-2 text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
							aria-label="Close menu"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>

					{/* Centered nav links */}
					<div className="flex-1 flex flex-col items-center justify-center gap-8">
						{navItems.map((item) => {
							const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`font-serif text-2xl tracking-wide transition-colors ${
										isActive
											? "text-[var(--color-text)]"
											: "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
									}`}
								>
									{item.label}
									{isActive && (
										<span className="block mt-1 mx-auto w-8 h-px bg-[var(--color-accent)]" />
									)}
								</Link>
							);
						})}
					</div>

					{/* Theme toggle at bottom */}
					<div className="flex justify-center pb-8">
						<ThemeToggle />
					</div>
				</div>
			)}

			{/* Logo spin animation */}
			<style jsx global>{`
				@keyframes logo-spin {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}
				.animate-logo-spin {
					display: inline-block;
					animation: logo-spin 1s ease-in-out;
				}
			`}</style>
		</header>
	);
}
