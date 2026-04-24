import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
	title: "JohnLin 的博客",
	description: "一名热爱技术与开源的大学生，记录技术学习与思考",
	openGraph: {
		title: "JohnLin 的博客",
		description: "一名热爱技术与开源的大学生，记录技术学习与思考",
		url: "https://johnlin.top",
	},
	twitter: {
		card: "summary_large_image",
		title: "JohnLin 的博客",
		description: "一名热爱技术与开源的大学生，记录技术学习与思考",
	},
	alternates: {
		canonical: "https://johnlin.top",
	},
};

export default function Page() {
	return <HomePageClient />;
}
