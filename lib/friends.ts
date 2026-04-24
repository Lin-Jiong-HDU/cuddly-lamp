export interface Friend {
	name: string;
	url: string;
	avatar?: string;
	description: string;
}

export const friends: Friend[] = [
	{
		name: "MOONSILVER",
		url: "https://www.moonsilver.work/",
		description: "杭州电子科技大学 · 热爱竞赛与科研，持续探索技术的边界",
	},
];
