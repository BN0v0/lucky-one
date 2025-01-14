'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { validatePet, validateProfile } from '@/utils/validation';
import ProgressSteps from '@/components/ProgressSteps';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface ProfileFormData {
  name: string;
  phone: string;
  address: string;
  nif: string;
  birthDate: string;
}

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  medicalInfo: string;
  specialNotes: string;
}

interface FormErrors {
  profile: Record<string, string>;
  pets: Record<string, string>[];
}

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    address: '',
    nif: '',
    birthDate: '',
  });

  const [pets, setPets] = useState<PetFormData[]>([{
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    medicalInfo: '',
    specialNotes: '',
  }]);

  const [errors, setErrors] = useState<FormErrors>({
    profile: {},
    pets: [{}],
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/login';
          return;
        }

        setUserId(session.user.id);

        // Try to load existing profile data
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          setProfileData({
            name: profile.name || '',
            phone: profile.phone || '',
            address: profile.address || '',
            nif: profile.nif || '',
            birthDate: profile.birth_date || '',
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        setError('Failed to load profile data');
      } finally {
        setPageLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePetChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newPets = [...pets];
    newPets[index] = { ...newPets[index], [e.target.name]: e.target.value };
    setPets(newPets);
  };

  const addPet = () => {
    setPets([...pets, {
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      weight: '',
      medicalInfo: '',
      specialNotes: '',
    }]);
  };

  const removePet = (index: number) => {
    if (pets.length > 1) {
      setPets(pets.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Create/update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: (await supabase.auth.getUser()).data.user?.email,
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          nif: profileData.nif,
          birth_date: profileData.birthDate,
        }, {
          onConflict: 'id',
        });

      if (profileError) throw profileError;

      // Add pets
      for (const pet of pets) {
        const { error: petError } = await supabase
          .from('pets')
          .insert({
            owner_id: userId,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            age: parseInt(pet.age) || 0,
            weight: parseFloat(pet.weight) || 0,
            medical_info: pet.medicalInfo,
            special_notes: pet.specialNotes,
          });

        if (petError) throw petError;
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Profile Completion Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ProgressSteps
            steps={['Personal Info', 'Pet Details', 'Review']}
            currentStep={1}
          />
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="mt-2 text-gray-600">Please provide your additional details and pet information</p>
          </div>

          <div className="bg-white shadow-xl rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="nif" className="block text-sm font-medium text-gray-700">
                      NIF
                    </label>
                    <input
                      id="nif"
                      name="nif"
                      type="text"
                      required
                      value={profileData.nif}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                      Birth Date
                    </label>
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      required
                      value={profileData.birthDate}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Pets Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Pet Information</h3>
                {pets.map((pet, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
                    {pets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePet(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pet form fields */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          name="name"
                          type="text"
                          required
                          value={pet.name}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Species</label>
                        <select
                          name="species"
                          required
                          value={pet.species}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="dog">Dog</option>
                          <option value="cat">Cat</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Breed</label>
                        <input
                          name="breed"
                          type="text"
                          required
                          value={pet.breed}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age (years)</label>
                        <input
                          name="age"
                          type="number"
                          min="0"
                          step="0.1"
                          required
                          value={pet.age}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                        <input
                          name="weight"
                          type="number"
                          min="0"
                          step="0.1"
                          required
                          value={pet.weight}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Medical Information</label>
                        <textarea
                          name="medicalInfo"
                          rows={3}
                          value={pet.medicalInfo}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Any medical conditions, allergies, or medications..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Special Notes</label>
                        <textarea
                          name="specialNotes"
                          rows={3}
                          value={pet.specialNotes}
                          onChange={(e) => handlePetChange(index, e)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Behavioral notes, preferences, or special care instructions..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPet}
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-gray-400"
                >
                  Add Another Pet
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
} 