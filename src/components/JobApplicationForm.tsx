import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Upload, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export default function JobApplicationForm({ jobId, jobTitle, onClose, onSubmitSuccess }: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cover_letter: ''
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
      setError(null);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return null;
    const fileExt = resumeFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resumeFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let resumeUrl = null;
      if (resumeFile) {
        setUploading(true);
        resumeUrl = await uploadResume();
        setUploading(false);
      }

      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          cover_letter: formData.cover_letter,
          resume_url: resumeUrl
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onSubmitSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
      setUploading(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0B1221]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-[#1C3D5A]">Apply for Position</h2>
            <p className="text-sm text-slate-500 font-medium">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-8">
          {success ? (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Sent!</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Thank you for applying. Our talent team will review your profile and contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                  <input
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+256..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Resume / CV</label>
                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer ${resumeFile
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                >
                  <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                  {resumeFile ? (
                    <div className="flex items-center gap-3 text-emerald-700">
                      <FileText size={28} />
                      <div className="text-left">
                        <p className="text-sm font-bold truncate max-w-[200px]">{resumeFile.name}</p>
                        <p className="text-[10px] uppercase font-black opacity-60">Click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-slate-400 mb-2" size={24} />
                      <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or Word (Max 5MB)</p>
                    </>
                  )}
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Cover Letter (Optional)</label>
                <textarea
                  rows={4}
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleInputChange}
                  placeholder="Tell us why you're a great fit..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !resumeFile}
                  className="flex-[2] bg-[#1C3D5A] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-yellow-500 hover:text-[#1C3D5A] transition-all disabled:opacity-50 disabled:hover:bg-[#1C3D5A] disabled:hover:text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {uploading ? 'Uploading Resume...' : 'Submitting...'}
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}