import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Chat | JohnLin",
	description: "和虚拟的 JohnLin 聊聊天",
	robots: { index: false, follow: false },
};

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
