import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Sparkles, Heart, Search, MapPin, Clock, Star, Award, Shield, Zap, Globe, TrendingUp, CheckCircle2, Quote, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe]/30 to-white">
        {/* Decorative droplet shape */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-drop-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight">
                  <span className="text-[#1e293b]">Small actions</span>
                  <br />
                  <span className="text-drop-500 bg-gradient-to-r from-drop-500 to-drop-600 bg-clip-text text-transparent">Lasting impact</span>
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-[#64748b] leading-relaxed max-w-xl">
                  Connect with local NGOs and charities that need your help. Every volunteer hour and donation is{' '}
                  <span className="text-drop-600 font-semibold">just a drop</span> that creates ripples of positive change.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-drop-500 hover:bg-drop-600 text-white text-base font-semibold px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href="/opportunities">
                    <Search className="h-5 w-5 mr-2" />
                    Find Opportunities
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-drop-500 text-drop-600 hover:bg-drop-500 hover:text-white text-base font-semibold px-8 py-6 h-auto bg-white shadow-md hover:shadow-lg transition-all" asChild>
                  <Link href="/organization/register">Register Organization</Link>
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative lg:h-[500px] h-[400px]">
              <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-white">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <img src="https://media.istockphoto.com/id/472102653/photo/volunteers-helping-to-clean-up-the-beachduring-hindu-ganesha-festival.jpg?s=612x612&w=0&k=20&c=O3h-FkgpdqNbr74ecQNXATgo_ZPJXst-jUZRJAzeK0Q=" alt="Description of image" className="object-cover w-full h-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1e293b]">How It Works</h2>
            <p className="text-lg md:text-xl text-[#64748b] max-w-2xl mx-auto">
              Making a difference is simple. Follow these steps to start your volunteering journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            <Card className="relative border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white group">
              <CardHeader className="space-y-4 p-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#1e293b]">Sign Up</CardTitle>
                <CardDescription className="text-base leading-relaxed text-[#64748b]">
                  Create your account as a volunteer or organization in minutes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white group">
              <CardHeader className="space-y-4 p-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#1e293b]">Discover</CardTitle>
                <CardDescription className="text-base leading-relaxed text-[#64748b]">
                  Browse opportunities that match your skills and interests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white group">
              <CardHeader className="space-y-4 p-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#1e293b]">Apply</CardTitle>
                <CardDescription className="text-base leading-relaxed text-[#64748b]">
                  Connect with organizations and apply to make an impact
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white group">
              <CardHeader className="space-y-4 p-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#1e293b]">Contribute</CardTitle>
                <CardDescription className="text-base leading-relaxed text-[#64748b]">
                  Start volunteering and create lasting positive change
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-br from-drop-500 to-drop-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Together, we're creating waves of positive change across communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-white mb-2">10K+</div>
              <div className="text-lg text-white/90">Volunteer Hours</div>
              <div className="text-sm text-white/70 mt-1">This year</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-white mb-2">500+</div>
              <div className="text-lg text-white/90">Active Volunteers</div>
              <div className="text-sm text-white/70 mt-1">And growing</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-white mb-2">100+</div>
              <div className="text-lg text-white/90">Partner Organizations</div>
              <div className="text-sm text-white/70 mt-1">Verified NGOs</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-black text-white mb-2">250+</div>
              <div className="text-lg text-white/90">Active Opportunities</div>
              <div className="text-sm text-white/70 mt-1">Right now</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 bg-drop-100 rounded-full text-sm font-bold text-drop-700 mb-4">
              Get Started Today
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Featured Opportunities
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Discover meaningful volunteer opportunities in your area
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Opportunity Card 1 */}
            <Card className="border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl group cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-drop-100 to-drop-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart className="h-20 w-20 text-drop-400" />
                </div>
              </div>
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>Mumbai, India</span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-drop-600 transition-colors">
                  Beach Cleanup Drive
                </CardTitle>
                <CardDescription className="text-base">
                  Join us for a weekend beach cleanup initiative. Help preserve marine life and keep our beaches clean.
                </CardDescription>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>4 hours</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>15 spots left</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Opportunity Card 2 */}
            <Card className="border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl group cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-20 w-20 text-amber-400" />
                </div>
              </div>
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>Delhi, India</span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-drop-600 transition-colors">
                  Teaching Underprivileged Kids
                </CardTitle>
                <CardDescription className="text-base">
                  Help educate children from underprivileged backgrounds. Share your knowledge and make a lasting impact.
                </CardDescription>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>2 hours/week</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>10 spots left</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Opportunity Card 3 */}
            <Card className="border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl group cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-20 w-20 text-green-400" />
                </div>
              </div>
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>Bangalore, India</span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-drop-600 transition-colors">
                  Tree Plantation Drive
                </CardTitle>
                <CardDescription className="text-base">
                  Be part of our green initiative. Help us plant 1000 trees and combat climate change in urban areas.
                </CardDescription>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>3 hours</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>25 spots left</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="border-2 border-drop-500 text-drop-600 hover:bg-drop-50 text-base font-semibold px-8 py-6 h-auto" asChild>
              <Link href="/opportunities">
                View All Opportunities
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Why Choose Just a Drop?
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              The trusted platform for volunteers and organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Verified Organizations</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                All NGOs and charities are thoroughly vetted and verified to ensure legitimacy and impact.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Quick Matching</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Our smart algorithm matches you with opportunities that fit your skills and availability.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Nationwide Reach</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Find opportunities across India. Make an impact in your local community or beyond.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Track Your Impact</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                See your contribution hours, certificates earned, and the lives you've touched.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Earn Recognition</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Get certificates, badges, and recognition for your volunteer work and contributions.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Community Support</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Join a community of passionate volunteers and connect with like-minded changemakers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 bg-drop-100 rounded-full text-sm font-bold text-drop-700 mb-4">
              Success Stories
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              What Our Community Says
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Real stories from volunteers and organizations making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="border-2 relative">
              <Quote className="absolute top-6 right-6 h-12 w-12 text-drop-100" />
              <CardHeader className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base text-slate-700 leading-relaxed">
                  "Just a Drop helped me find the perfect volunteering opportunity. I've been teaching kids for 6 months now and it's been incredibly rewarding!"
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                  <span className="text-white font-bold">PR</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Priya Sharma</div>
                  <div className="text-sm text-slate-600">Volunteer, Mumbai</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 relative">
              <Quote className="absolute top-6 right-6 h-12 w-12 text-drop-100" />
              <CardHeader className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base text-slate-700 leading-relaxed">
                  "As an NGO, this platform has connected us with amazing volunteers. The verification process ensures quality and commitment from both sides."
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                  <span className="text-white font-bold">RK</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Rajesh Kumar</div>
                  <div className="text-sm text-slate-600">NGO Director, Delhi</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 relative">
              <Quote className="absolute top-6 right-6 h-12 w-12 text-drop-100" />
              <CardHeader className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base text-slate-700 leading-relaxed">
                  "The impact tracking feature is brilliant! I can see my contribution hours and the difference I'm making. Very motivating!"
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
                  <span className="text-white font-bold">AN</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Anita Nair</div>
                  <div className="text-sm text-slate-600">Volunteer, Bangalore</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-drop-500 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white fill-white" />
                </div>
                <span className="font-bold text-xl">Just A Drop</span>
              </div>
              <p className="text-slate-400">
                Connecting volunteers with meaningful opportunities to create lasting impact in communities.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/opportunities" className="text-slate-400 hover:text-white transition-colors">Browse Opportunities</Link></li>
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/volunteer/register" className="text-slate-400 hover:text-white transition-colors">Become a Volunteer</Link></li>
                <li><Link href="/organization/register" className="text-slate-400 hover:text-white transition-colors">Register Your NGO</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Guidelines</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Success Stories</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2024 Just A Drop. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  )
}
