'use client'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Sparkles, Heart, Search, MapPin, Clock, Shield, Zap, Globe, TrendingUp, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { Footer } from '@/components/footer'
import { FeatureCard } from '@/components/ui/feature-card'
import { TestimonialCard } from '@/components/ui/testimonial-card'
import { WhyChooseCard } from '@/components/ui/why-choose-card'
import { SectionHeader } from '@/components/ui/section-header'

export default function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: Users,
      title: 'Sign Up',
      description: 'Create your account as a volunteer or organization in minutes',
    },
    {
      icon: Sparkles,
      title: 'Discover',
      description: 'Browse opportunities that match your skills and interests',
    },
    {
      icon: Heart,
      title: 'Apply',
      description: 'Connect with organizations and apply to make an impact',
    },
    {
      icon: Building2,
      title: 'Contribute',
      description: 'Start volunteering and create lasting positive change',
    },
  ]

  const impactStats = [
    { value: '10K+', label: 'Volunteer Hours', sublabel: 'This year' },
    { value: '500+', label: 'Active Volunteers', sublabel: 'And growing' },
    { value: '100+', label: 'Partner Organizations', sublabel: 'Verified NGOs' },
    { value: '250+', label: 'Active Opportunities', sublabel: 'Right now' },
  ]

  const featuredOpportunities = [
    {
      title: 'Beach Cleanup Drive',
      location: 'Mumbai, India',
      description: 'Join us for a weekend beach cleanup initiative. Help preserve marine life and keep our beaches clean.',
      time: '4 hours',
      spots: '15 spots left',
      gradient: 'from-drop-100 to-drop-200',
      icon: Heart,
      iconColor: 'text-drop-400',
    },
    {
      title: 'Teaching Underprivileged Kids',
      location: 'Delhi, India',
      description: 'Help educate children from underprivileged backgrounds. Share your knowledge and make a lasting impact.',
      time: '2 hours/week',
      spots: '10 spots left',
      gradient: 'from-amber-100 to-amber-200',
      icon: Users,
      iconColor: 'text-amber-400',
    },
    {
      title: 'Tree Plantation Drive',
      location: 'Bangalore, India',
      description: 'Be part of our green initiative. Help us plant 1000 trees and combat climate change in urban areas.',
      time: '3 hours',
      spots: '25 spots left',
      gradient: 'from-green-100 to-green-200',
      icon: Sparkles,
      iconColor: 'text-green-400',
    },
  ]

  const whyChooseUs = [
    {
      icon: Shield,
      title: 'Verified Organizations',
      description: 'All NGOs and charities are thoroughly vetted and verified to ensure legitimacy and impact.',
    },
    {
      icon: Zap,
      title: 'Quick Matching',
      description: 'Our smart algorithm matches you with opportunities that fit your skills and availability.',
    },
    {
      icon: Globe,
      title: 'Nationwide Reach',
      description: 'Find opportunities across India. Make an impact in your local community or beyond.',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Impact',
      description: 'See your contribution hours, certificates earned, and the lives you\'ve touched.',
    },
    {
      icon: Award,
      title: 'Earn Recognition',
      description: 'Get certificates, badges, and recognition for your volunteer work and contributions.',
    },
    {
      icon: Heart,
      title: 'Community Support',
      description: 'Join a community of passionate volunteers and connect with like-minded changemakers.',
    },
  ]

  const testimonials = [
    {
      rating: 5,
      text: '"Just a Drop helped me find the perfect volunteering opportunity. I\'ve been teaching kids for 6 months now and it\'s been incredibly rewarding!"',
      author: 'Priya Sharma',
      role: 'Volunteer, Mumbai',
      initials: 'PR',
    },
    {
      rating: 5,
      text: '"As an NGO, this platform has connected us with amazing volunteers. The verification process ensures quality and commitment from both sides."',
      author: 'Rajesh Kumar',
      role: 'NGO Director, Delhi',
      initials: 'RK',
    },
    {
      rating: 5,
      text: '"The impact tracking feature is brilliant! I can see my contribution hours and the difference I\'m making. Very motivating!"',
      author: 'Anita Nair',
      role: 'Volunteer, Bangalore',
      initials: 'AN',
    },
  ]

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
                {!user && (
                  <Button size="lg" variant="outline" className="border-2 border-drop-500 text-drop-600 hover:bg-drop-500 hover:text-white text-base font-semibold px-8 py-6 h-auto bg-white shadow-md hover:shadow-lg transition-all" asChild>
                    <Link href="/organization/register">Register Organization</Link>
                  </Button>
                )}
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
          <SectionHeader
            title="How It Works"
            description="Making a difference is simple. Follow these steps to start your volunteering journey."
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-br from-drop-500 to-drop-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:30px_30px]"></div>

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
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-lg text-white/90">{stat.label}</div>
                <div className="text-sm text-white/70 mt-1">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeader
            badge="Get Started Today"
            title="Featured Opportunities"
            description="Discover meaningful volunteer opportunities in your area"
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredOpportunities.map((opportunity, index) => (
              <Card key={index} className="border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl group cursor-pointer">
                <div className={`h-48 bg-gradient-to-br ${opportunity.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <opportunity.icon className={`h-20 w-20 ${opportunity.iconColor}`} />
                  </div>
                </div>
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-drop-600 transition-colors">
                    {opportunity.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {opportunity.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{opportunity.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.spots}</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
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
          <SectionHeader
            title="Why Choose Just a Drop?"
            description="The trusted platform for volunteers and organizations"
            className="mb-16"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <WhyChooseCard
                key={index}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <SectionHeader
            badge="Success Stories"
            title="What Our Community Says"
            description="Real stories from volunteers and organizations making a difference"
            className="mb-16"
          />

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                rating={testimonial.rating}
                text={testimonial.text}
                author={testimonial.author}
                role={testimonial.role}
                initials={testimonial.initials}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
