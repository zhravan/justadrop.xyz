import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Sparkles, Heart, Search } from 'lucide-react'
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
                  <span className="text-[#1e293b]">Small actions,</span>
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

    </main>
  )
}
