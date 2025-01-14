import React, { useState } from 'react';
import { Pet } from '@/types';
import { supabase } from '@/lib/supabase';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPetModal: React.FC<AddPetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [breed, setBreed] = useState('');
  const [chipNumber, setChipNumber] = useState('');
  const [vaccines, setVaccines] = useState('');
  const [error, setError] = useState('');

  const validateChipNumber = (number: string) => {
    const regex = /^[0-9]{15}$/; // Example: 15-digit chip number
    return regex.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateChipNumber(chipNumber)) {
      setError('Chip number must be a 15-digit number.');
      return;
    }

    const newPet: Pet = {
      name,
      age: parseInt(age),
      breed,
      chipNumber,
      vaccines,
      owner_id: 'user_id', // Replace with actual user ID
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('pets').insert([newPet]);
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding pet:', error);
      setError('Error adding pet. Please try again.');
    }
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add a New Pet</h2>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Chip Number</label>
              <input
                type="text"
                value={chipNumber}
                onChange={(e) => setChipNumber(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Vaccines</label>
              <textarea
                value={vaccines}
                onChange={(e) => setVaccines(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="List of vaccines"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Add Pet
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null
  );
};

export default AddPetModal; 