'use client';
import { useState, useEffect } from 'react';

const slides = [
    {
        image: '/auth-slide-1.png',
        title: 'Secure & Reliable',
        description: 'Your data is protected with enterprise-grade security'
    },
    {
        image: '/auth-slide-2.png',
        title: 'Boost Productivity',
        description: 'Streamline your workflow and manage orders efficiently'
    },
    {
        image: '/auth-slide-3.png',
        title: 'Team Collaboration',
        description: 'Work together seamlessly with your team members'
    }
];

export default function AuthCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative z-10 flex flex-col items-center justify-center py-8">
            {/* Image Container with Fade Transition */}
            <div className="relative w-72 h-72 mb-6">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>

            {/* Text Content with Fade Transition */}
            <div className="text-center space-y-2 h-20 relative w-full max-w-sm">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <h3 className="text-xl font-bold text-white">{slide.title}</h3>
                        <p className="text-primary-100 text-sm">{slide.description}</p>
                    </div>
                ))}
            </div>

            {/* Dot Indicators */}
            <div className="flex gap-2 mt-6">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
