"use client"

import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Target, Award, User } from "lucide-react"

export default function AboutPage() {
  const milestones = [
    { year: "2023", event: "Salomat.health founded with a vision to democratize healthcare" },
    { year: "2023", event: "First AI-powered health assistant launched" },
    { year: "2024", event: "Reached 1,000+ healthcare professionals on platform" },
    { year: "2024", event: "Served over 50,000 patients worldwide" },
  ]

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "Leading cardiologist with 15+ years of experience",
    },
    {
      name: "Alex Chen",
      role: "CEO & Founder",
      description: "Healthcare technology entrepreneur and innovator",
    },
    {
      name: "Maria Rodriguez",
      role: "Head of AI Development",
      description: "AI researcher specializing in healthcare applications",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About Salomat.health</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to make quality healthcare accessible to everyone, everywhere, through innovative
            technology and compassionate care.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To bridge the gap between patients and healthcare providers through cutting-edge telemedicine
                technology, making quality healthcare accessible, affordable, and available 24/7 to people around the
                world.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-primary" />
                <span>Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A world where geographical barriers don't limit access to healthcare, where AI-powered insights enhance
                human expertise, and where every person can receive timely, personalized medical care regardless of
                their location.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground mb-6">
                  Salomat.health was founded in 2023 by a team of healthcare professionals, technologists, and
                  entrepreneurs who witnessed firsthand the challenges people face in accessing quality healthcare.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  The COVID-19 pandemic highlighted the critical need for remote healthcare solutions. We saw patients
                  struggling to get timely consultations, doctors overwhelmed with administrative tasks, and healthcare
                  systems strained beyond capacity.
                </p>
                <p className="text-lg text-muted-foreground">
                  That's when we decided to create Salomat.health - a comprehensive telemedicine platform that combines
                  the expertise of qualified healthcare professionals with the power of artificial intelligence to
                  deliver personalized, accessible, and efficient healthcare services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Patient-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every decision we make is guided by what's best for our patients and their health outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We maintain the highest standards in healthcare delivery and technological innovation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Compassion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We approach healthcare with empathy, understanding, and genuine care for every individual.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-lg">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Patients Served</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1K+</div>
              <p className="text-muted-foreground">Healthcare Professionals</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100K+</div>
              <p className="text-muted-foreground">Consultations Completed</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Availability</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
