'use client';

import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';

interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: number;
  species: string;
  image_url?: string;
}

export default function PetProfileCard({ pet }: { pet: Pet }) {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center p-6">
        <div className="w-24 h-24 mb-3 rounded-lg bg-indigo-100 flex items-center justify-center">
          {pet.image_url ? (
            <img 
              src={pet.image_url} 
              alt={pet.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <HeartIcon className="h-12 w-12 text-indigo-600" />
          )}
        </div>
        <h5 className="mb-1 text-xl font-medium text-gray-900">{pet.name}</h5>
        <span className="text-sm text-gray-500">{pet.species} • {pet.breed}</span>
        <div className="mt-2 text-sm text-gray-500">{pet.weight}kg</div>
        <Link
          href={`/dashboard/pets/${pet.id}`}
          className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
} 