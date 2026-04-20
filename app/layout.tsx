import type { Metadata } from "next";
import { DM_Sans, Crimson_Pro } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EasterEggManager } from "@/components/easter-eggs/EasterEggManager";
import { SpeedInsights } from "@vercel/speed-insights/next";

const dmSans = DM_Sans({
	subsets: ["latin"],
	variable: "--font-dm-sans",
	display: "swap",
});

const crimsonPro = Crimson_Pro({
	subsets: ["latin"],
	variable: "--font-crimson-pro",
	display: "swap",
});

const mesloLGS = localFont({
	src: [
		{
			path: "../public/fonts/MesloLGS NF Regular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/MesloLGS NF Italic.ttf",
			weight: "400",
			style: "italic",
		},
		{
			path: "../public/fonts/MesloLGS NF Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "../public/fonts/MesloLGS NF Bold Italic.ttf",
			weight: "700",
			style: "italic",
		},
	],
	variable: "--font-meslo",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://johnlin.top"),
	title: "JohnLin 的博客",
	description: "一名热爱技术与开源的大学生，记录技术学习与思考",
	openGraph: {
		siteName: "JohnLin 的博客",
		locale: "zh_CN",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
	},
	robots: {
		index: true,
		follow: true,
	},
};

function JsonLd() {
	const schema = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": "https://johnlin.top/#website",
				url: "https://johnlin.top",
				name: "JohnLin 的博客",
				description: "一名热爱技术与开源的大学生，记录技术学习与思考",
				inLanguage: "zh-CN",
			},
			{
				"@type": "Person",
				"@id": "https://johnlin.top/#person",
				name: "JohnLin",
				url: "https://johnlin.top",
			},
		],
	};
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<body className={`${dmSans.variable} ${crimsonPro.variable} ${mesloLGS.variable}`}>
				<JsonLd />
				<ThemeProvider>
					<EasterEggManager />
					<div className="min-h-screen flex flex-col">
						<Navigation />
						<main className="flex-1">{children}</main>
						<footer className="py-12 text-center text-sm text-[var(--color-text-muted)]">
							<p>© {new Date().getFullYear()} JohnLin · Built with Next.js</p>
						</footer>
					</div>
				</ThemeProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}
