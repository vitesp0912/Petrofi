import React from 'react';
import { Star } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './ui/carousel';

const TESTIMONIALS = [
    {
        quote: 'We used to write everything in the register. At night the cash never matched. Now I open the app and I can see today’s sale on my phone.',
        name: 'Rajesh Sharma',
        pump: 'Sharma Fuel Station',
        city: 'Jaipur, Rajasthan',
        avatar: 'RS',
        color: '#0D1B3E',
    },
    {
        quote: 'Udhar customers used to get missed. Someone paid, someone didn’t, and we forgot. Now I can see who still has to pay.',
        name: 'Suresh Patel',
        pump: 'Patel Service Station',
        city: 'Ahmedabad, Gujarat',
        avatar: 'SP',
        color: '#38B6FF',
    },
    {
        quote: 'I have three operators. Earlier I never knew who sold what. Now every shift is in the app. I check from home also.',
        name: 'Mohan Kumar',
        pump: 'Kumar Petroleum',
        city: 'Pune, Maharashtra',
        avatar: 'MK',
        color: '#0D1B3E',
    },
];

const Stars = () => (
    <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
        ))}
    </div>
);

const TestimonialCard = ({ quote, name, pump, city, avatar, color, index, isVisible }) => (
    <div
        data-testid={`testimonial-card-${index}`}
        className={`module-card bg-white rounded-2xl p-6 border border-slate-100 shadow-sm fade-up ${isVisible ? 'visible' : ''} delay-${(index + 1) * 100}`}
    >
        <Stars />
        <p className="text-sm text-slate-600 font-jakarta leading-relaxed mb-6">
            "{quote}"
        </p>
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold font-outfit flex-shrink-0"
                style={{ backgroundColor: color }}
            >
                {avatar}
            </div>
            <div>
                <p className="text-sm font-bold font-outfit text-pf-navy">{name}</p>
                <p className="text-xs text-slate-500 font-jakarta">
                    {pump} · {city}
                </p>
            </div>
        </div>
    </div>
);

const TestimonialsSection = () => {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <section data-testid="testimonials-section" className="py-20 md:py-24 bg-slate-50 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
                    <p className="text-pf-sky text-sm font-semibold font-jakarta uppercase tracking-widest mb-3">Testimonials</p>
                    <h2 className="text-3xl sm:text-4xl font-bold font-outfit text-pf-navy leading-tight mb-12">
                        What Petrol Pump Owners Say
                    </h2>

                    {/* Mobile carousel */}
                    <div className="md:hidden">
                        <Carousel
                            opts={{ align: 'start', loop: true }}
                            className="w-full"
                        >
                            <CarouselContent>
                                {TESTIMONIALS.map((testimonial, i) => (
                                    <CarouselItem key={testimonial.name}>
                                        <TestimonialCard
                                            {...testimonial}
                                            index={i}
                                            isVisible={isVisible}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 bg-white shadow-md border-0" />
                            <CarouselNext className="right-3 top-1/2 -translate-y-1/2 bg-white shadow-md border-0" />
                        </Carousel>
                    </div>

                    {/* Desktop grid */}
                    <div className="hidden md:grid grid-cols-3 gap-6">
                        {TESTIMONIALS.map((testimonial, i) => (
                            <TestimonialCard
                                key={testimonial.name}
                                {...testimonial}
                                index={i}
                                isVisible={isVisible}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
