import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "游戏室 | JohnLin",
  description: "隐藏的游戏游乐场",
  robots: { index: false, follow: false },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
