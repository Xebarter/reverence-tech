import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
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
import CareersManagement from './components/admin/Careers';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import BlogManagement from './components/admin/Blog';
import AdminAuth from './components/admin/Auth';
import ProtectedRouteTemp from './components/admin/ProtectedRouteTemp';
import UserManagement from './components/admin/UserManagement';
import Unauthorized from './components/admin/Unauthorized';
import TestAdminUsers from './components/admin/TestAdminUsers';
import DatabaseTest from './components/admin/DatabaseTest';
import SEO from './components/SEO';
import { MessageCircle } from 'lucide-react';

function App() {
  const [isTestimonialFormOpen, setIsTestimonialFormOpen] = useState(false);

  const handleOpenTestimonialForm = () => {
    setIsTestimonialFormOpen(true);
  };

  const handleCloseTestimonialForm = () => {
    setIsTestimonialFormOpen(false);
  };

  return (
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
        <Route path="/test-db" element={<DatabaseTest />} />
        
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
        <Route path="/admin-temp" element={<ProtectedRouteTemp><AdminLayout /></ProtectedRouteTemp>}>
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
        <MessageCircle size={24} />
      </a>
    </div>
  );
}

export default App;