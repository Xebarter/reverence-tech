import { Award, Users, TrendingUp, Heart } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1C3D5A] mb-4">
            Why Choose <span className="text-[#2DBE7E]">Reverence Technology</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We understand the unique challenges and opportunities of the East African market.
            Our solutions are designed with local context in mind, from mobile money integration
            to off-grid power considerations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-[#2DBE7E]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-[#2DBE7E]" size={36} />
            </div>
            <h3 className="text-3xl font-bold text-[#1C3D5A] mb-2">5+</h3>
            <p className="text-gray-600 font-medium">Years Experience</p>
          </div>

          <div className="text-center">
            <div className="bg-[#F2B134]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-[#F2B134]" size={36} />
            </div>
            <h3 className="text-3xl font-bold text-[#1C3D5A] mb-2">200+</h3>
            <p className="text-gray-600 font-medium">Satisfied Clients</p>
          </div>

          <div className="text-center">
            <div className="bg-[#1C3D5A]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-[#1C3D5A]" size={36} />
            </div>
            <h3 className="text-3xl font-bold text-[#1C3D5A] mb-2">350+</h3>
            <p className="text-gray-600 font-medium">Projects Completed</p>
          </div>

          <div className="text-center">
            <div className="bg-[#2DBE7E]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-[#2DBE7E]" size={36} />
            </div>
            <h3 className="text-3xl font-bold text-[#1C3D5A] mb-2">98%</h3>
            <p className="text-gray-600 font-medium">Client Retention</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1C3D5A] to-[#143040] rounded-2xl p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-center">Our Mission</h3>
            <p className="text-lg text-[#E5E8EB] leading-relaxed text-center mb-8">
              To bridge the digital divide across East Africa by providing accessible, affordable,
              and innovative technology solutions that empower businesses, communities, and individuals
              to thrive in the digital age.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-[#2DBE7E] font-bold text-lg mb-2">Innovation</div>
                <p className="text-sm text-[#E5E8EB]">Cutting-edge solutions adapted for local needs</p>
              </div>
              <div className="text-center">
                <div className="text-[#F2B134] font-bold text-lg mb-2">Accessibility</div>
                <p className="text-sm text-[#E5E8EB]">Technology within reach of every organization</p>
              </div>
              <div className="text-center">
                <div className="text-[#2DBE7E] font-bold text-lg mb-2">Partnership</div>
                <p className="text-sm text-[#E5E8EB]">Long-term relationships built on trust</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
