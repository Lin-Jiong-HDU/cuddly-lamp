"use client";

import { motion } from "framer-motion";
import { classicProjects } from "@/lib/open-source-data/projects";

export default function ProjectGallery() {
  return (
    <section className="py-20 px-6 bg-[#050510]">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl text-white mb-12 text-center"
        >
          开源恒星系统
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classicProjects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-all"
            >
              <div
                className="w-3 h-3 rounded-full mb-4"
                style={{ backgroundColor: project.color }}
              />
              <h3 className="font-serif text-lg text-white mb-2 group-hover:text-white/80">
                {project.name}
              </h3>
              <p className="text-sm text-white/50 mb-2">{project.description}</p>
              <span className="text-xs text-white/30">{project.category}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
