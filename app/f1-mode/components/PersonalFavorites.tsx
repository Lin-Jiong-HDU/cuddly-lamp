"use client";

import { motion } from "framer-motion";

interface FavoriteItem {
	category: string;
	name: string;
	detail: string;
}

const favorites: FavoriteItem[] = [
	{
		category: "最爱车手",
		name: "Charles Leclerc 🇲🇨",
		detail: "#16 Ferrari",
	},
	{
		category: "最爱车队",
		name: "Scuderia Ferrari",
		detail: "Italian Racing Red",
	},
	{
		category: "最爱分站",
		name: "Monza",
		detail: "Temple of Speed",
	},
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
			ease: "easeOut" as const,
		},
	},
};

export default function PersonalFavorites() {
	return (
		<section className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#0a0a0a]">
			<div className="max-w-4xl w-full">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="font-serif text-3xl md:text-4xl text-white mb-12 text-center"
				>
					My F1 Favorites
				</motion.h2>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					className="grid md:grid-cols-3 gap-6"
				>
					{favorites.map((item) => (
						<motion.div
							key={item.category}
							variants={itemVariants}
							className="p-6 rounded-lg bg-[#1a1a1a] border border-[#E10600]/30 hover:border-[#E10600] transition-colors duration-300"
							style={{
								boxShadow: "0 0 20px rgba(225, 6, 0, 0.1)",
							}}
						>
							<div className="text-sm text-[#E10600] mb-2 uppercase tracking-wider">
								{item.category}
							</div>
							<div className="text-xl text-white font-medium mb-1">
								{item.name}
							</div>
							<div className="text-sm text-gray-400">
								{item.detail}
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
