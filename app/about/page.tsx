import GitHubCalendar from "./github-calendar";
import GitHubActivity from "./github-activity";

export default function AboutPage() {
	return (
		<div className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<header className="mb-16 opacity-0 animate-fade-in-up">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-12 h-px bg-[var(--color-accent)]" />
						<span className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase">
							关于
						</span>
					</div>
					<h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)]">
						你好，我是 JohnLin
					</h1>
				</header>

				{/* Content */}
				<div className="space-y-8 opacity-0 animate-fade-in-up delay-200">
					<p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
						我是一名大学生，目前专注于后端技术的学习与实践。热爱编程，享受用代码解决问题的过程。
					</p>

					<p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
						我热衷于参与开源项目，相信协作与分享的力量。同时也非常喜欢参加黑客松，那种在有限时间内创造出新东西的感觉让我着迷。
					</p>

					<p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
						这个博客是我记录技术学习、项目经验和个人思考的地方。希望能与你分享我的成长历程。
					</p>
				</div>

				{/* GitHub Contributions */}
				<GitHubCalendar username="Lin-Jiong-HDU" />

				{/* GitHub Activity */}
				<GitHubActivity username="Lin-Jiong-HDU" limit={5} />

				{/* Tech Stack */}
				<section className="mt-20 opacity-0 animate-fade-in-up delay-300">
					<h2 className="font-serif text-2xl text-[var(--color-text)] mb-8">
						技术栈
					</h2>
					<div className="space-y-8">
						{[
							{
								title: "后端开发",
								items: ["Go", "Python", "Node.js", "PostgreSQL", "Redis"],
							},
							{
								title: "DevOps & 工具",
								items: ["Docker", "Linux", "Git", "CI/CD", "Vim"],
							},
							{
								title: "前端开发",
								items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
							},
							{
								title: "正在学习",
								items: ["Rust", "Kubernetes", "分布式系统", "系统设计"],
							},
						].map((category, index) => (
							<div key={index}>
								<h3 className="font-serif text-lg text-[var(--color-text)] mb-3">
									{category.title}
								</h3>
								<div className="flex flex-wrap gap-x-4 gap-y-3">
									{category.items.map((item) => (
										<span
											key={item}
											className="inline-flex items-center px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-md whitespace-nowrap"
										>
											{item}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Interests */}
				<section className="mt-20 opacity-0 animate-fade-in-up delay-400">
					<h2 className="font-serif text-2xl text-[var(--color-text)] mb-8">
						兴趣领域
					</h2>
					<div className="grid gap-6">
						{[
							{
								title: "开源项目",
								description:
									"积极参与开源社区，贡献代码，学习最佳实践。相信开源是技术进步的重要推动力。",
							},
							{
								title: "黑客松",
								description:
									"享受黑客松的快节奏和创新氛围。喜欢在短时间内将想法变成原型，挑战自己的极限。",
							},
							{
								title: "后端架构",
								description:
									"对分布式系统、高并发、数据库设计等后端核心话题有浓厚兴趣，持续学习与实践。",
							},
						].map((item, index) => (
							<div
								key={index}
								className="p-6 bg-[var(--color-surface)] border-l-2 border-[var(--color-accent)]"
							>
								<h3 className="font-serif text-lg text-[var(--color-text)] mb-2">
									{item.title}
								</h3>
								<p className="text-[var(--color-text-secondary)]">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Contact */}
				<section className="mt-20 opacity-0 animate-fade-in-up delay-500">
					<h2 className="font-serif text-2xl text-[var(--color-text)] mb-6">
						联系我
					</h2>
					<p className="text-[var(--color-text-secondary)] mb-4">
						欢迎交流技术、讨论开源项目，或者一起组队参加黑客松：
					</p>
					<div className="flex flex-wrap gap-4">
						{[
							{ name: "GitHub", href: "https://github.com/Lin-Jiong-HDU" },
							{ name: "Email", href: "mailto:linjiong2020@outlook.com" },
							{ name: "Twitter", href: "" },
						].map((item) => (
							<a
								key={item.name}
								href={item.href}
								className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all"
								target="_blank"
								rel="noopener noreferrer"
							>
								{item.name}
							</a>
						))}
					</div>
				</section>

				{/* Decorative */}
				<div className="mt-20 flex justify-center opacity-0 animate-fade-in delay-600">
					<div className="flex items-center gap-4">
						<div className="w-12 h-px bg-[var(--color-border)]" />
						<div className="font-serif text-sm text-[var(--color-text-muted)]">
							Keep Coding, Keep Learning
						</div>
						<div className="w-12 h-px bg-[var(--color-border)]" />
					</div>
				</div>
			</div>
		</div>
	);
}
