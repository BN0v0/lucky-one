'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const features = [
    {
      title: 'Expert Trainers',
      description: 'Our certified trainers have years of experience working with all dog breeds.',
      icon: '🎓',
    },
    {
      title: 'Modern Facility',
      description: "State-of-the-art facilities designed for your dog&apos;s comfort and safety.",
      icon: '🏢',
    },
    {
      title: 'Personalized Care',
      description: "Tailored programs to meet your dog&apos;s specific needs and personality.",
      icon: '❤️',
    },
  ];

  const services = [
    {
      title: 'Training',
      description: 'Obedience training and behavior modification',
      image: '/images/training.jpg',
    },
    {
      title: 'Daycare',
      description: 'Supervised play and socialization',
      image: '/images/daycare.jpg',
    },
    {
      title: 'Boarding',
      description: 'Comfortable overnight stays',
      image: '/images/boarding.jpg',
    },
    {
      title: 'Grooming',
      description: 'Professional grooming services',
      image: '/images/grooming.jpg',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-dog.jpg"
            alt="Happy dog"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Professional Dog Care Services
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Training, daycare, and boarding services for your beloved pets
            </p>
            <div className="space-x-4">
              <Link
                href="/services"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Our Services
              </Link>
              <Link
                href="/contact"
                className="bg-white hover:bg-gray-100 text-indigo-600 px-6 py-3 rounded-md font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Us?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services Preview */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.title} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="relative h-48">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <Link
                    href={`/services#${service.title.toLowerCase()}`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8">Book a service or contact us for more information.</p>
            <Link
              href="/dashboard/book"
              className="bg-white hover:bg-gray-100 text-indigo-600 px-6 py-3 rounded-md font-medium"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
