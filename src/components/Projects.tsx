import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Smartphone,
  ArrowRight,
  Layers,
  Search,
  Layout
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  mobile_image_url: string | null;
  link: string | null;
  technologies: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(3); // Limit to 3 projects for the homepage

      if (error) throw error;
      setProjects(data || []);
    } catch (_error) {
      console.error('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <section className="py-24 px-4 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 text-center mb-16">
            <div className="h-10 bg-slate-200 animate-pulse w-64 mx-auto rounded-lg" />
            <div className="h-4 bg-slate-200 animate-pulse w-96 mx-auto rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-[350px] shadow-sm border border-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] min-h-screen">
      {/* Scope description styling for cards */}
      <style>{`
        .project-card-description p {
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0 0 0.5rem 0;
        }
        .project-card-description strong { font-weight: 600; color: #1e293b; }
        .project-card-description:last-child { margin-bottom: 0; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="h-3 w-3" /> Our Portfolio
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Digital Solutions & <span className="text-indigo-600">Innovation</span>
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            A curated selection of projects where technical excellence meets business transformation.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Portfolio under maintenance</h3>
            <p className="mt-2 text-slate-500">We are currently updating our latest success stories.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full cursor-pointer hover:-translate-y-1"
                  onClick={() => handleProjectClick(project.id)}
                >
                  {/* Visual Preview Header (Containment Logic) */}
                  <div className="flex h-36 bg-slate-100 border-b border-slate-100 relative overflow-hidden">
                    {/* Desktop Preview Panel */}
                    <div className="w-2/3 border-r border-slate-200/50 bg-slate-50 relative flex items-center justify-center p-2">
                      <div className="absolute top-2 left-2 flex gap-1 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      </div>
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt="Desktop"
                          className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <Monitor className="h-6 w-6 text-slate-200" />
                      )}
                      <span className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Desktop</span>
                    </div>

                    {/* Mobile Preview Panel */}
                    <div className="w-1/3 bg-slate-100 relative flex items-center justify-center p-2">
                      {project.mobile_image_url ? (
                        <img
                          src={project.mobile_image_url}
                          alt="Mobile"
                          className="w-full h-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:rotate-2 group-hover:scale-110"
                        />
                      ) : (
                        <Smartphone className="h-5 w-5 text-slate-200" />
                      )}
                      <span className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Mobile</span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                    </div>

                    <div className="flex-1 min-h-0">
                      <div
                        className="text-slate-600 text-sm mb-4 project-card-description line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                      />
                    </div>

                    <div className="pt-2">
                      {/* Tech Badges */}
                      <div className="flex flex-wrap gap-1 mb-4 min-h-[28px]">
                        {project.technologies.slice(0, 2).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-100"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 2 && (
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">
                            +{project.technologies.length - 2}
                          </span>
                        )}
                      </div>

                      <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 text-white rounded-lg group-hover:bg-indigo-600 transition-all duration-300 text-sm font-bold shadow">
                        View Details
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View More Button */}
            <div className="text-center mt-10">
              <button
                onClick={() => navigate('/projects')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow hover:shadow-md"
              >
                View More Projects
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {/* Bottom Social Proof / CTA */}
        <div className="mt-16 p-6 rounded-2xl bg-indigo-900 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
            <Layout size={200} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-1">Have a project in mind?</h3>
            <p className="text-indigo-200 mb-4 text-sm">Let's build something exceptional together.</p>
            <button 
              className="px-6 py-2.5 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-md text-sm"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.hash = 'contact';
                }
              }}
            >
              Start a Conversation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;