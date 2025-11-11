import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import SubmitTestimonial from './components/SubmitTestimonial';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import Messages from './components/admin/Messages';
import ServicesManagement from './components/admin/Services';
import HeroImages from './components/admin/HeroImages';
import TestimonialsManagement from './components/admin/Testimonials';
import Careers from './components/Careers';
import JobApplicationForm from './components/JobApplicationForm';
import CareersManagement from './components/admin/Careers';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import BlogManagement from './components/admin/Blog';
import AdminAuth from './components/admin/Auth';
import ProtectedRouteTemp from './components/admin/ProtectedRouteTemp';
import UserManagement from './components/admin/UserManagement';
import Unauthorized from './components/admin/Unauthorized';
import TestAdminUsers from './components/admin/TestAdminUsers';
import SEO from './components/SEO';
import { MessageCircle } from 'lucide-react';
import { UserProvider } from './UserContext';

function App() {
  const [isTestimonialFormOpen, setIsTestimonialFormOpen] = useState(false);

  const handleOpenTestimonialForm = () => {
    setIsTestimonialFormOpen(true);
  };

  const handleCloseTestimonialForm = () => {
    setIsTestimonialFormOpen(false);
  };

  return (
    <UserProvider>
      <div>
        <SEO />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <div className="min-h-screen">
              <Header />
              <main>
                <Hero />
                <About />
                <Services />
                <Testimonials onShowTestimonialForm={handleOpenTestimonialForm} />
                <SubmitTestimonial 
                  isOpen={isTestimonialFormOpen} 
                  onClose={handleCloseTestimonialForm} 
                />
                <Contact />
              </main>
              <Footer />
            </div>
          } />
          
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/test-admin" element={<TestAdminUsers />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="hero-images" element={<HeroImages />} />
            <Route path="testimonials" element={<TestimonialsManagement />} />
            <Route path="careers" element={<CareersManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          
          {/* Temporary admin route for testing without admin checks */}
          <Route path="/admin-temp" element={
            <div className="min-h-screen">
              <AdminLayout />
            </div>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="hero-images" element={<HeroImages />} />
            <Route path="testimonials" element={<TestimonialsManagement />} />
            <Route path="careers" element={<CareersManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          
          <Route path="/admin/auth" element={<AdminAuth />} />
        </Routes>
        
        {/* WhatsApp Button - Visible on all pages */}
        <a 
          href="https://wa.me/256783676313" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 z-40"
          aria-label="Contact us on WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </UserProvider>
  );
}

export default App;