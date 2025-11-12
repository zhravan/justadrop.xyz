import Link from 'next/link';
import { ArrowRight, Heart, Users, Calendar, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">JustADrop</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/opportunities"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Browse Opportunities
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Make a Difference,
            <span className="text-primary-600"> One Drop at a Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with meaningful volunteer opportunities that match your skills and passion.
            Together, we can create positive change in our communities.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/register?role=volunteer"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition flex items-center space-x-2 text-lg"
            >
              <span>Find Opportunities</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/register?role=organization"
              className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition text-lg"
            >
              Post Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Users, label: 'Active Volunteers', value: '10,000+' },
            { icon: Heart, label: 'Opportunities', value: '500+' },
            { icon: Calendar, label: 'Events Completed', value: '2,000+' },
            { icon: Award, label: 'Hours Volunteered', value: '50,000+' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Sign Up',
                description: 'Create your profile as a volunteer or organization in minutes.',
              },
              {
                title: 'Connect',
                description: 'Browse opportunities that match your skills and interests.',
              },
              {
                title: 'Make Impact',
                description: 'Join events, track your hours, and see your impact grow.',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of volunteers and organizations creating positive change.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition inline-flex items-center space-x-2 text-lg font-semibold"
          >
            <span>Get Started Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-primary-600" />
                <span className="text-xl font-bold text-white">JustADrop</span>
              </div>
              <p className="text-sm">Making the world better, one drop at a time.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Volunteers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/opportunities" className="hover:text-white">Browse Opportunities</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Organizations</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/register?role=organization" className="hover:text-white">Register Organization</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © {new Date().getFullYear()} JustADrop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

