"use client";

import { motion } from "framer-motion";

interface Race {
	round: number;
	name: string;
	location: string;
	country: string;
	date: string;
	sprint?: boolean;
}

// 2026 F1 赛历
const races: Race[] = [
	{ round: 1, name: "Australian Grand Prix", location: "Melbourne", country: "🇦🇺", date: "Mar 6-8" },
	{ round: 2, name: "Chinese Grand Prix", location: "Shanghai", country: "🇨🇳", date: "Mar 13-15", sprint: true },
	{ round: 3, name: "Japanese Grand Prix", location: "Suzuka", country: "🇯🇵", date: "Mar 27-29" },
	{ round: 4, name: "Bahrain Grand Prix", location: "Sakhir", country: "🇧🇭", date: "Apr 10-12" },
	{ round: 5, name: "Saudi Arabian Grand Prix", location: "Jeddah", country: "🇸🇦", date: "Apr 17-19" },
	{ round: 6, name: "Miami Grand Prix", location: "Miami", country: "🇺🇸", date: "May 1-3", sprint: true },
	{ round: 7, name: "Canadian Grand Prix", location: "Montreal", country: "🇨🇦", date: "May 22-24", sprint: true },
	{ round: 8, name: "Monaco Grand Prix", location: "Monte Carlo", country: "🇲🇨", date: "Jun 5-7" },
	{ round: 9, name: "Spanish Grand Prix", location: "Barcelona", country: "🇪🇸", date: "Jun 12-14" },
	{ round: 10, name: "Austrian Grand Prix", location: "Spielberg", country: "🇦🇹", date: "Jun 26-28" },
	{ round: 11, name: "British Grand Prix", location: "Silverstone", country: "🇬🇧", date: "Jul 3-5", sprint: true },
	{ round: 12, name: "Belgian Grand Prix", location: "Spa", country: "🇧🇪", date: "Jul 17-19" },
	{ round: 13, name: "Hungarian Grand Prix", location: "Budapest", country: "🇭🇺", date: "Jul 24-26" },
	{ round: 14, name: "Dutch Grand Prix", location: "Zandvoort", country: "🇳🇱", date: "Aug 21-23", sprint: true },
	{ round: 15, name: "Italian Grand Prix", location: "Monza", country: "🇮🇹", date: "Sep 4-6" },
	{ round: 16, name: "Madrid Grand Prix", location: "Madrid", country: "🇪🇸", date: "Sep 11-13" },
	{ round: 17, name: "Azerbaijan Grand Prix", location: "Baku", country: "🇦🇿", date: "Sep 24-26" },
	{ round: 18, name: "Singapore Grand Prix", location: "Singapore", country: "🇸🇬", date: "Oct 9-11", sprint: true },
	{ round: 19, name: "United States Grand Prix", location: "Austin", country: "🇺🇸", date: "Oct 23-25" },
	{ round: 20, name: "Mexico City Grand Prix", location: "Mexico City", country: "🇲🇽", date: "Oct 30-Nov 1" },
	{ round: 21, name: "São Paulo Grand Prix", location: "São Paulo", country: "🇧🇷", date: "Nov 6-8" },
	{ round: 22, name: "Las Vegas Grand Prix", location: "Las Vegas", country: "🇺🇸", date: "Nov 19-21" },
	{ round: 23, name: "Qatar Grand Prix", location: "Lusail", country: "🇶🇦", date: "Nov 27-29" },
	{ round: 24, name: "Abu Dhabi Grand Prix", location: "Yas Marina", country: "🇦🇪", date: "Dec 4-6" },
];

const containerVariants = {
	hidden: { opacity: 1 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: {
		opacity: 0,
		y: 20,
		scale: 0.95
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.4,
			ease: "easeOut" as const,
		},
	},
};

export default function RaceCalendar() {
	return (
		<section className="min-h-screen flex items-center justify-center px-6 py-20 bg-[#0a0a0a]">
			<div className="max-w-3xl w-full">
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="font-serif text-3xl md:text-4xl text-white mb-4 text-center"
				>
					2026 Season
				</motion.h2>
				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-gray-400 text-center mb-12"
				>
					24 Races Around The World
				</motion.p>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
					className="space-y-2"
				>
					{races.map((race) => (
						<motion.div
							key={race.round}
							variants={itemVariants}
							className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors group"
						>
							<div className="w-8 text-sm text-gray-500 font-mono">
								{String(race.round).padStart(2, "0")}
							</div>
							<div className="text-xl">{race.country}</div>
							<div className="flex-1">
								<div className="text-white group-hover:text-[#E10600] transition-colors flex items-center gap-2">
									{race.name.replace(" Grand Prix", "")}
									{race.sprint && (
										<span className="text-xs px-1.5 py-0.5 bg-[#E10600]/20 text-[#E10600] rounded">
											Sprint
										</span>
									)}
								</div>
								<div className="text-xs text-gray-500">
									{race.location}
								</div>
							</div>
							<div className="text-sm text-gray-400 font-mono">
								{race.date}
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
