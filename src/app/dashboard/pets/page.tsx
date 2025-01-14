'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/types';
import { PlusIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AddPetModal from '@/components/pets/AddPetModal';
import Toast from '@/components/ui/Toast';
import PetCard from '@/components/dashboard/pets/PetCard';

type ToastState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

const INITIAL_TOAST_STATE: ToastState = {
  show: false,
  message: '',
  type: 'success'
};

export default function PetsPage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(INITIAL_TOAST_STATE);

  const showToast = useCallback((message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const loadPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error loading pets:', error);
      showToast('Error loading pets. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handlePetAdded = useCallback(() => {
    loadPets();
    setIsAddModalOpen(false);
    showToast('Wonderful! Your new furry friend has been added! 🎉', 'success');
  }, [loadPets, showToast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent border-indigo-600"></div>
        <p className="text-gray-500 animate-pulse">Finding your furry friends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HeartIcon className="h-8 w-8" />
              My Beloved Pets
            </h1>
            <p className="mt-2 text-indigo-100">
              A special place for your amazing companions
            </p>
          </div>
          <AddPetButton onClick={() => setIsAddModalOpen(true)} />
        </div>
      </header>

      <main className="space-y-8">
        {pets.length === 0 ? (
          <EmptyPetsState onAddPet={() => setIsAddModalOpen(true)} />
        ) : (
          <PetGrid 
            pets={pets} 
            onUpdate={loadPets}
            showToast={showToast}
          />
        )}
      </main>

      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePetAdded}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  );
}

function AddPetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-6 py-3 border border-transparent
                 text-base font-medium rounded-full text-white 
                 bg-white/20 hover:bg-white/30 backdrop-blur-sm
                 transition-all duration-200 ease-in-out transform hover:scale-105
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white
                 shadow-lg hover:shadow-xl"
    >
      <PlusIcon className="h-5 w-5 mr-2" />
      Add New Friend
    </button>
  );
}

function EmptyPetsState({ onAddPet }: { onAddPet: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-indigo-300 
                    shadow-sm hover:border-indigo-400 transition-colors duration-200">
      <div className="max-w-md mx-auto">
        <SparklesIcon className="mx-auto h-16 w-16 text-indigo-400" />
        <h3 className="mt-4 text-xl font-medium text-gray-900">Welcome to Your Pet Family!</h3>
        <p className="mt-2 text-gray-500 leading-relaxed">
          This is where your amazing journey with your pets begins. Ready to add your first furry, feathery, or scaly friend?
        </p>
        <div className="mt-8">
          <button
            onClick={onAddPet}
            className="inline-flex items-center px-6 py-3 border border-transparent
                       text-base font-medium rounded-full text-white 
                       bg-gradient-to-r from-indigo-600 to-purple-600
                       hover:from-indigo-700 hover:to-purple-700
                       transition-all duration-200 ease-in-out transform hover:scale-105
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                       shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Pet
          </button>
        </div>
      </div>
    </div>
  );
}

function PetGrid({ 
  pets, 
  onUpdate, 
  showToast 
}: { 
  pets: Pet[];
  onUpdate: () => void;
  showToast: (message: string, type: ToastState['type']) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pets.map((pet) => (
        <div key={pet.id} className="transform transition-all duration-200 hover:scale-105">
          <PetCard 
            pet={pet}
            onUpdate={onUpdate}
            showToast={showToast}
          />
        </div>
      ))}
    </div>
  );
}
export type { ToastState };
