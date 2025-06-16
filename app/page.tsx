"use client"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Clock, Users, Star, CheckCircle } from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()

  const features = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Expert Care",
      description: "Connect with qualified healthcare professionals",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Private",
      description: "Your health data is protected with enterprise-grade security",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "24/7 Available",
      description: "Get medical assistance whenever you need it",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "AI Assistant",
      description: "Get instant health insights with our AI-powered assistant",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "Salomat.health has revolutionized how I manage my health. The AI assistant is incredibly helpful!",
      rating: 5,
    },
    {
      name: "Dr. Michael Chen",
      role: "Cardiologist",
      content: "As a doctor, I appreciate the seamless communication with patients and the comprehensive tools.",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Patient",
      content: "The prescription management and reminders have made my treatment so much easier to follow.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">{t("hero.title")}</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{t("hero.subtitle")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-3">
                    {t("hero.cta")}
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    Find a Doctor
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-6 mt-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">1000+ Doctors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">50K+ Patients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/placeholder.svg?height=600&width=800"
                  alt="Healthcare professionals"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Salomat.health?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of healthcare with our comprehensive platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Trusted by thousands of patients and healthcare professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients who trust Salomat.health for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
