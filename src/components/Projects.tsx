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
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (_error) {
      console.error('Error fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
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
              <div key={i} className="bg-white rounded-2xl h-[450px] shadow-sm border border-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] min-h-screen">
      {/* Scope description styling for cards */}
      <style>{`
        .project-card-description p {
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .project-card-description strong { font-weight: 600; color: #1e293b; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Layers className="h-3 w-3" /> Our Portfolio
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Digital Solutions & <span className="text-indigo-600">Innovation</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A curated selection of projects where technical excellence meets business transformation.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Portfolio under maintenance</h3>
            <p className="mt-2 text-slate-500">We are currently updating our latest success stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full cursor-pointer hover:-translate-y-2"
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Visual Preview Header (Containment Logic) */}
                <div className="flex h-48 bg-slate-100 border-b border-slate-100 relative overflow-hidden">
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
                      <Monitor className="h-8 w-8 text-slate-200" />
                    )}
                    <span className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Desktop</span>
                  </div>

                  {/* Mobile Preview Panel */}
                  <div className="w-1/3 bg-slate-100 relative flex items-center justify-center p-3">
                    {project.mobile_image_url ? (
                      <img
                        src={project.mobile_image_url}
                        alt="Mobile"
                        className="w-full h-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:rotate-2 group-hover:scale-110"
                      />
                    ) : (
                      <Smartphone className="h-6 w-6 text-slate-200" />
                    )}
                    <span className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Mobile</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  <div
                    className="text-slate-600 text-sm mb-6 flex-grow project-card-description line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />

                  <div className="mt-auto space-y-6">
                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded border border-slate-100"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    <button className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl group-hover:bg-indigo-600 transition-all duration-300 text-sm font-bold shadow-lg shadow-slate-200 group-hover:shadow-indigo-200">
                      View Details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Social Proof / CTA */}
        <div className="mt-20 p-8 rounded-3xl bg-indigo-900 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
            <Layout size={300} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Have a project in mind?</h3>
            <p className="text-indigo-200 mb-6">Let's build something exceptional together.</p>
            <button 
              className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl"
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