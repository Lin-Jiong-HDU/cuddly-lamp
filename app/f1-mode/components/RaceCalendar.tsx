"use client";

import { motion } from "framer-motion";

interface Race {
	round: number;
	name: string;
	location: string;
	country: string;
	date: string;
}

// 2025 F1 赛历
const races: Race[] = [
	{ round: 1, name: "Bahrain Grand Prix", location: "Sakhir", country: "🇧🇭", date: "Mar 2" },
	{ round: 2, name: "Saudi Arabian Grand Prix", location: "Jeddah", country: "🇸🇦", date: "Mar 9" },
	{ round: 3, name: "Australian Grand Prix", location: "Melbourne", country: "🇦🇺", date: "Mar 16" },
	{ round: 4, name: "Chinese Grand Prix", location: "Shanghai", country: "🇨🇳", date: "Mar 23" },
	{ round: 5, name: "Japanese Grand Prix", location: "Suzuka", country: "🇯🇵", date: "Apr 6" },
	{ round: 6, name: "Bahrain Grand Prix", location: "Sakhir", country: "🇧🇭", date: "Apr 13" },
	{ round: 7, name: "Saudi Arabian Grand Prix", location: "Jeddah", country: "🇸🇦", date: "Apr 20" },
	{ round: 8, name: "Miami Grand Prix", location: "Miami", country: "🇺🇸", date: "May 4" },
	{ round: 9, name: "Emilia Romagna Grand Prix", location: "Imola", country: "🇮🇹", date: "May 18" },
	{ round: 10, name: "Monaco Grand Prix", location: "Monte Carlo", country: "🇲🇨", date: "May 25" },
	{ round: 11, name: "Spanish Grand Prix", location: "Barcelona", country: "🇪🇸", date: "Jun 1" },
	{ round: 12, name: "Canadian Grand Prix", location: "Montreal", country: "🇨🇦", date: "Jun 15" },
	{ round: 13, name: "Austrian Grand Prix", location: "Spielberg", country: "🇦🇹", date: "Jun 29" },
	{ round: 14, name: "British Grand Prix", location: "Silverstone", country: "🇬🇧", date: "Jul 6" },
	{ round: 15, name: "Belgian Grand Prix", location: "Spa", country: "🇧🇪", date: "Jul 27" },
	{ round: 16, name: "Hungarian Grand Prix", location: "Budapest", country: "🇭🇺", date: "Aug 3" },
	{ round: 17, name: "Dutch Grand Prix", location: "Zandvoort", country: "🇳🇱", date: "Aug 31" },
	{ round: 18, name: "Italian Grand Prix", location: "Monza", country: "🇮🇹", date: "Sep 7" },
	{ round: 19, name: "Azerbaijan Grand Prix", location: "Baku", country: "🇦🇿", date: "Sep 21" },
	{ round: 20, name: "Singapore Grand Prix", location: "Singapore", country: "🇸🇬", date: "Oct 5" },
	{ round: 21, name: "United States Grand Prix", location: "Austin", country: "🇺🇸", date: "Oct 19" },
	{ round: 22, name: "Mexico City Grand Prix", location: "Mexico City", country: "🇲🇽", date: "Oct 26" },
	{ round: 23, name: "São Paulo Grand Prix", location: "São Paulo", country: "🇧🇷", date: "Nov 9" },
	{ round: 24, name: "Las Vegas Grand Prix", location: "Las Vegas", country: "🇺🇸", date: "Nov 22" },
	{ round: 25, name: "Qatar Grand Prix", location: "Lusail", country: "🇶🇦", date: "Nov 30" },
	{ round: 26, name: "Abu Dhabi Grand Prix", location: "Yas Marina", country: "🇦🇪", date: "Dec 7" },
];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.3,
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
					2025 Season
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
					viewport={{ once: true, margin: "-50px" }}
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
								<div className="text-white group-hover:text-[#E10600] transition-colors">
									{race.name.replace(" Grand Prix", "")}
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
