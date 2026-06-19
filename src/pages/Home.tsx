import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import DestinationGrid from "../components/DestinationGrid";
import NewsletterSection from "../components/NewsletterSection";
import FeaturedSection from "../components/FeaturedSection";
import ItinerarySection from "../components/ItinerarySection";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot"; // <-- add

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedSection />
      <NewsletterSection />
      <CategorySection />
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
