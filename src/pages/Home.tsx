import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import DestinationGrid from "../components/DestinationGrid";
import NewsletterSection from "../components/NewsletterSection";
import FeaturedSection from "../components/FeaturedSection";
import ItinerarySection from "../components/ItinerarySection";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";
import EventCard from "../components/EventCard"; // NEW
import { getAllEvents } from "../services/eventService"; // NEW
import type { Event } from "../types"; // NEW
import { Link } from "react-router-dom"; // NEW

const Home = () => {
  // NEW: Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // NEW: Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEvents({
          status: "upcoming",
          limit: 3,
        });
        setEvents(res.data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedSection />
      <NewsletterSection />
      <CategorySection />

      {/* NEW: Events Section */}
      {!eventsLoading && events.length > 0 && (
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#C9922A] to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-px bg-[#C9922A]" />
                  <span className="text-[#C9922A] text-[10px] tracking-[0.35em] uppercase font-light">
                    Upcoming Events
                  </span>
                </div>
                <h2
                  className="text-[#1a3a5c] font-light"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "2.8rem",
                    fontStyle: "italic",
                  }}
                >
                  Festivals & Celebrations
                </h2>
                <p className="text-gray-400 text-sm font-light mt-2 max-w-md">
                  Experience Sri Lanka's vibrant culture through its events and
                  festivals
                </p>
              </div>
              <Link
                to="/events"
                className="flex items-center gap-2 text-[#C9922A] text-[11px] tracking-[0.2em] uppercase font-light hover:opacity-70 transition-opacity"
              >
                View All Events
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Popular Destinations
        </h2>
        <DestinationGrid />
      </div>
      <ItinerarySection />
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Home;
