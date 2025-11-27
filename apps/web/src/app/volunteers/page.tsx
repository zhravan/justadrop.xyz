'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Users, MapPin, Heart, Clock, Briefcase, Mail, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  pincode: string
  interests: string[]
  skills: string | null
  availability: string
  bio: string | null
  experience: string | null
  motivation: string | null
  email_verified: boolean
  createdAt: string
  updatedAt: string
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null)

  useEffect(() => {
    fetchVolunteers()
  }, [])

  useEffect(() => {
    filterVolunteers()
  }, [searchQuery, selectedInterest, volunteers])

  const fetchVolunteers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/volunteers`)
      const data = await response.json()
      
      // Only show email-verified volunteers on public page
      const verifiedVolunteers = data.filter((v: Volunteer) => v.email_verified)
      setVolunteers(verifiedVolunteers)
      setFilteredVolunteers(verifiedVolunteers)
    } catch (error) {
      console.error('Error fetching volunteers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterVolunteers = () => {
    let filtered = volunteers

    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.skills?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedInterest) {
      filtered = filtered.filter(v => v.interests.includes(selectedInterest))
    }

    setFilteredVolunteers(filtered)
  }

  const allInterests = Array.from(new Set(volunteers.flatMap(v => v.interests)))
  
  const stats = [
    {
      icon: Users,
      label: 'Active Volunteers',
      value: volunteers.length,
      color: 'text-drop-600',
      bgColor: 'bg-drop-100'
    },
    {
      icon: MapPin,
      label: 'Cities Covered',
      value: new Set(volunteers.map(v => v.city)).size,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Heart,
      label: 'Causes Supported',
      value: allInterests.length,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100'
    },
    {
      icon: Clock,
      label: 'Hours Contributed',
      value: volunteers.length * 25, // Estimated
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    }
  ]

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-white via-drop-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-drop-500 via-drop-600 to-drop-700 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 lg:px-8 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-4">
              🌟 Community Heroes
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
              Meet Our Volunteers
            </h1>
            <p className="text-xl text-drop-100 leading-relaxed max-w-2xl mx-auto">
              Discover amazing individuals who are making a difference in communities across India.
              Connect with passionate volunteers ready to create positive change.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats Overview */}
      <section className="container mx-auto px-4 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-black text-slate-900 mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, location, skills, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-slate-300 focus:border-drop-500 rounded-xl"
            />
          </div>

          {/* Interest Filter */}
          {allInterests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Filter by Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedInterest === null ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all ${
                    selectedInterest === null 
                      ? 'bg-drop-600 hover:bg-drop-700' 
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => setSelectedInterest(null)}
                >
                  All ({volunteers.length})
                </Badge>
                {allInterests.map((interest) => {
                  const count = volunteers.filter(v => v.interests.includes(interest)).length
                  return (
                    <Badge
                      key={interest}
                      variant={selectedInterest === interest ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm font-semibold transition-all ${
                        selectedInterest === interest 
                          ? 'bg-drop-600 hover:bg-drop-700' 
                          : 'hover:bg-slate-100'
                      }`}
                      onClick={() => setSelectedInterest(interest)}
                    >
                      {interest} ({count})
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Volunteers Grid */}
      <section className="container mx-auto px-4 lg:px-8 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-drop-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading volunteers...</p>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No volunteers found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedInterest
                ? "Try adjusting your search or filters"
                : "Be the first to join our community!"}
            </p>
            {!searchQuery && !selectedInterest && (
              <Button asChild className="bg-drop-600 hover:bg-drop-700">
                <Link href="/volunteer/register">
                  Become a Volunteer
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-slate-600 font-medium">
                Showing <span className="text-drop-600 font-bold">{filteredVolunteers.length}</span> volunteer{filteredVolunteers.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVolunteers.map((volunteer) => (
                <Card key={volunteer.id} className="border-2 border-slate-200 hover:border-drop-400 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6 space-y-4">
                    {/* Avatar & Name */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center text-white font-black text-2xl">
                        {volunteer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-drop-600 transition-colors">
                          {volunteer.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{volunteer.city}, {volunteer.state}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {volunteer.bio && (
                      <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                        {volunteer.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {volunteer.skills && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          <Briefcase className="w-4 h-4" />
                          Skills
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {volunteer.skills}
                        </p>
                      </div>
                    )}

                    {/* Interests */}
                    {volunteer.interests.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          <Heart className="w-4 h-4" />
                          Interests
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.interests.slice(0, 3).map((interest, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-drop-100 text-drop-700 hover:bg-drop-200">
                              {interest}
                            </Badge>
                          ))}
                          {volunteer.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                              +{volunteer.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Availability */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t border-slate-200">
                      <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium text-emerald-700">{volunteer.availability}</span>
                    </div>

                    {/* Contact Button */}
                    <Button
                      variant="outline"
                      className="w-full border-2 border-drop-300 hover:bg-drop-50 hover:border-drop-500 text-drop-700 font-semibold group-hover:shadow-md transition-all"
                      asChild
                    >
                      <a href={`mailto:${volunteer.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Volunteer
                        <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

    </main>
  )
}
