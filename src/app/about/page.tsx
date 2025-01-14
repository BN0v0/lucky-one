import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h1>
          <p className="text-lg text-gray-600 mb-4">
            At Dog Service Platform, we're dedicated to providing the highest quality care and training
            for your beloved pets. Our mission is to create a safe, nurturing environment where dogs
            can learn, socialize, and thrive.
          </p>
          <p className="text-lg text-gray-600">
            Founded in 2020, we've helped hundreds of dogs and their owners build stronger
            relationships through professional training, engaging daycare programs, and comfortable
            boarding services.
          </p>
        </div>
        <div className="relative h-[400px]">
          <Image
            src="/images/about-mission.jpg"
            alt="Dog training session"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Team Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'John Smith',
              role: 'Head Trainer',
              bio: '15+ years of experience in dog training and behavior modification.',
              image: '/images/team-1.jpg',
            },
            {
              name: 'Sarah Johnson',
              role: 'Facility Manager',
              bio: 'Ensures the highest standards of care and safety for all our guests.',
              image: '/images/team-2.jpg',
            },
            {
              name: 'Mike Wilson',
              role: 'Senior Trainer',
              bio: 'Specializes in puppy training and socialization programs.',
              image: '/images/team-3.jpg',
            },
          ].map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative h-64 mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
              <p className="text-indigo-600 mb-2">{member.role}</p>
              <p className="text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Excellence',
              description: 'We strive for excellence in everything we do, from training to care.',
              icon: '⭐',
            },
            {
              title: 'Compassion',
              description: 'Every dog is treated with love, patience, and understanding.',
              icon: '❤️',
            },
            {
              title: 'Safety',
              description: 'The safety and well-being of your pets is our top priority.',
              icon: '🛡️',
            },
          ].map((value) => (
            <div key={value.title} className="text-center">
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 