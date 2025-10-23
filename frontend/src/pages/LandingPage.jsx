import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">EduPreneur</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 font-display mb-6">
              Teach Kids
              <span className="text-primary-600 block">Entrepreneurship</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              An interactive platform that teaches children about money management, 
              business concepts, and entrepreneurial thinking through fun modules and real-world simulations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                Start Free Trial
                <FiArrowRight className="ml-2" />
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary text-lg px-8 py-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose EduPreneur?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make learning about money and business fun, safe, and educational for children of all ages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Parent Dashboard</h3>
              <p className="text-gray-600">
                Monitor your child's progress, track learning achievements, and manage their educational journey.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="text-secondary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe Learning</h3>
              <p className="text-gray-600">
                COPPA-compliant platform with secure login codes and comprehensive privacy protection for children.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMail className="text-accent-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Modules</h3>
              <p className="text-gray-600">
                Age-appropriate content with quizzes, simulations, and hands-on activities that make learning fun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our students achieve career breakthroughs through our courses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Alex (10 years old)</h3>
                  <p className="text-gray-600 text-sm">Elementary Student</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Through EduPreneur's courses, I learned how to manage my allowance, and now I've saved $100 and I'm ready to start a small business!"</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Money Basics Course
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold text-lg">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sarah (12 years old)</h3>
                  <p className="text-gray-600 text-sm">Middle School Student</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"The virtual office let me experience what it's like to be a boss, and now I know how to create a business plan!"</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Entrepreneurship Simulation
                </span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold text-lg">M</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mike (14 years old)</h3>
                  <p className="text-gray-600 text-sm">High School Student</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Through gamified learning, I not only learned about investing and finance, but also developed teamwork skills!"</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Advanced Business Course
                </span>
              </div>
            </div>
          </div>
          
          {/* View More Stories Button */}
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              View More Success Stories
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Child's Entrepreneurial Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of parents who are already teaching their children valuable life skills
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-4 px-8 rounded-lg text-lg inline-flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Now
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">EduPreneur</h3>
            <p className="text-gray-400 mb-4">
              Teaching Kids Entrepreneurship & Money Management
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 EduPreneur. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
