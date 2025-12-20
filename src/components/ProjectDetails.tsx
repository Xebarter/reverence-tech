import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Monitor,
  Smartphone,
  Cpu,
  Calendar,
  ChevronRight,
  ShieldCheck
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

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (id) {
      fetchProject(id);
      fetchRelatedProjects();
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_featured', true)
        .limit(3);

      if (error) throw error;
      setRelatedProjects(data || []);
    } catch (error) {
      console.error('Error fetching related projects:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium italic">Loading project masterclass...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-32 px-4 bg-slate-50 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Project Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-semibold hover:underline">
          Return to Portfolio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* CSS for rich text content from Supabase */}
      <style>{`
        .prose-content h1, .prose-content h2, .prose-content h3 { color: #0F172A; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; }
        .prose-content p { color: #475569; line-height: 1.8; margin-bottom: 1.25rem; }
        .prose-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; color: #475569; }
        .prose-content li { margin-bottom: 0.5rem; }
        .prose-content strong { color: #1E293B; font-weight: 600; }
      `}</style>

      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Projects
              </button>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md font-semibold text-sm"
                >
                  Live Site <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">

            {/* Desktop Mockup Frame */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Web Interface</h3>
                </div>
                {project.is_featured && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2 py-1 rounded border border-emerald-100">
                    <ShieldCheck className="h-3 w-3" /> Featured Work
                  </span>
                )}
              </div>

              <div className="group relative">
                {/* Browser Controls */}
                <div className="bg-slate-800 rounded-t-xl p-3 flex gap-1.5 items-center border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <div className="ml-4 bg-slate-700/50 rounded px-4 py-1 text-[11px] text-slate-400 w-full max-w-sm truncate font-mono">
                    {project.link || "https://case-study-preview.internal"}
                  </div>
                </div>
                {/* Image Container with Contain logic */}
                <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500">
                  <div className="bg-slate-50 flex items-center justify-center min-h-[300px] max-h-[600px] w-full overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt="Desktop Experience"
                        className="w-full h-full max-h-[600px] object-contain block"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Monitor className="h-10 w-10 opacity-20" />
                        <span className="text-sm italic">Desktop preview unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Project Deep Dive Text */}
            <article className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">
                The Challenge & Solution
              </h2>
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </article>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">

            {/* Mobile View Mockup - Fixed height, Contain enabled */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-500" /> Mobile Experience
              </h3>
              <div className="relative mx-auto w-full max-w-[260px] border-[8px] border-slate-900 rounded-[3rem] shadow-2xl aspect-[9/18] bg-slate-900 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  {project.mobile_image_url ? (
                    <img
                      src={project.mobile_image_url}
                      alt="Mobile UI"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-600 text-xs text-center p-8 italic">
                      Mobile responsive design <br /> screenshot coming soon
                    </div>
                  )}
                </div>
                {/* iPhone-style dynamic island/notch placeholder */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10" />
              </div>
            </div>

            {/* Tech Stack Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-500" /> Core Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-2"><Calendar className="h-4 w-4" /> Launched</span>
                  <span className="font-semibold">
                    {new Date(project.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="h-px bg-slate-800 w-full" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-2"><Globe className="h-4 w-4" /> Type</span>
                  <span className="font-semibold">Full-Stack Solution</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects - Grid Layout with containment */}
        {relatedProjects.length > 0 && (
          <div className="mt-20 border-t border-slate-200 pt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-10">More Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedProjects
                .filter(p => p.id !== project.id)
                .slice(0, 2)
                .map((rp) => (
                  <Link
                    to={`/project/${rp.id}`}
                    key={rp.id}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden relative border-b border-slate-100 flex items-center justify-center">
                      <img
                        src={rp.image_url || ''}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        alt={rp.title}
                      />
                      <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                        {rp.title}
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                      </h4>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;