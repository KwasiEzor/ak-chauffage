import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MapPin, Calendar, Expand } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import type { Project } from '../types/content';
import OptimizedImage from './OptimizedImage';

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { content } = useContent();

  // Get active projects from content
  const projects = (content?.projects || [])
    .filter((project) => project.active)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="realisations"
      ref={sectionRef}
      className="section-padding bg-[#12121a] relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            Nos Réalisations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Derniers Projets{' '}
            <span className="text-gradient">Réalisés</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Découvrez nos dernières installations et transformations. 
            Des projets sur mesure pour répondre aux besoins spécifiques de chaque client.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() => setSelectedProject(project)}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <OptimizedImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold">
                  {project.category}
                </span>
              </div>

              {/* Expand Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Expand className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {project.date}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View More CTA */}
        <div className="text-center mt-12">
          <button
            onClick={scrollToContact}
            className="btn-secondary inline-flex items-center gap-2"
          >
            Voir toutes nos réalisations
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '5000+', label: 'Installations' },
              { value: '15+', label: 'Années d\'expérience' },
              { value: '98%', label: 'Clients satisfaits' },
              { value: '7j/7', label: 'Service disponible' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#151520] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              aria-label="Fermer la fenêtre"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
            >
              ×
            </button>
            <div className="aspect-video">
              <OptimizedImage
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium mb-4">
                {selectedProject.category}
              </span>
              <h3 className="text-2xl font-bold text-white mb-4">{selectedProject.title}</h3>
              <div className="flex items-center gap-6 text-zinc-400 mb-4">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedProject.location}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {selectedProject.date}
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{selectedProject.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
