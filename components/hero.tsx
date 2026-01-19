"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, Zap, PieChart } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      title: "Smart Analytics",
      description: "AI-powered insights to understand your spending patterns",
    },
    {
      icon: <PieChart className="w-6 h-6 text-green-600" />,
      title: "Budget Planning",
      description: "Set goals and track progress toward your financial targets",
    },
    {
      icon: <Zap className="w-6 h-6 text-green-600" />,
      title: "Real-Time Sync",
      description: "Instant updates across all your devices",
    },
  ];

  const capabilities = [
    "Multi-Currency Support",
    "Expense Categorization",
    "Custom Reports",
    "Receipt Scanning",
    "Budget Alerts",
    "Export to CSV",
  ];

  return (
    <section className="pt-40 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
          Manage Your Finances <br /> with Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        <div className="flex justify-center space-x-4 mb-5">
          <Link href="/sign-in">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="https://github.com/ShivamKarna/Paisa_Kharcha">
            <Button size="lg" variant="outline" className="px-8">
              See Docs
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl border border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-lg"
            >
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Capabilities Scroll */}
        <div className="mt-24 overflow-hidden">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-medium">
            Platform Capabilities
          </p>
          <div className="relative">
            <div className="flex animate-scroll">
              {[...capabilities, ...capabilities, ...capabilities].map(
                (capability, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 mx-6 px-6 py-3 bg-gray-50 rounded-full border border-gray-200 text-gray-700 font-medium"
                  >
                    {capability}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
