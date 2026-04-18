import Link from "next/link";
import { EventCard } from "@/components/public/event-card";
import { getPublishedEvents } from "@/lib/queries/events.queries";
import { getTicketTypesByEvent } from "@/lib/queries/ticketTypes.queries";
import { Calendar, Users, Shield, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Event } from "@/lib/types/event.type";
import { Navigation } from "@/components/public/navigation";
import { Footer } from "@/components/public/footer";


export default async function HomePage() {
  // Fetch featured/upcoming events
  const upcomingEvents = await getPublishedEvents({ limit: 6 });

  // Enhance events with lowest ticket price
  const eventsWithPrices = await Promise.all(
    upcomingEvents.map(async (event: Event) => {
      const tickets = await getTicketTypesByEvent(event.id);
      const lowestPrice = tickets.length > 0 
        ? Math.min(...tickets.filter(t => t.isActive).map(t => t.price))
        : 0;
      
      return {
        ...event,
        lowestPrice,
      };
    })
  );

  const features = [
    {
      icon: Calendar,
      title: "Easy Discovery",
      description: "Browse thousands of events happening across Nigeria",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment processing with Paystack",
    },
    {
      icon: Users,
      title: "Instant Tickets",
      description: "Get your tickets instantly delivered to your email",
    },
    {
      icon: TrendingUp,
      title: "For Organizers",
      description: "Grow your event business with our powerful tools",
    },
  ];

  return (
    <div className="bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Nigeria&apos;s Premier Event Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Events Near You
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              From concerts and festivals to conferences and workshops - find
              and book tickets to the best events happening in Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/events"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center shadow-lg"
              >
                Browse Events
              </Link>
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-16 md:h-24 fill-white"
          >
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Upcoming Events
              </h2>
              <p className="text-gray-600">
                Don&apos;t miss out on these amazing experiences
              </p>
            </div>
            <Link
              href="/events"
              className="hidden md:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {eventsWithPrices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {eventsWithPrices.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Events Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for exciting events!
              </p>
            </div>
          )}

          <Link
            href="/events"
            className="md:hidden flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <span>View All Events</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose EventHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The easiest way to discover, book, and manage event tickets in
              Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
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
      <section className="bg-linear-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Host Your Own Event?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of organizers using EventHub to sell tickets and
              grow their audience
            </p>
            <Link
              href="/sign-up"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Selling Tickets
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}