import React, { useState } from 'react';
import { Pet } from '@/types';
import { supabase } from '@/lib/supabase';
import { 
  HeartIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CalendarIcon,
  IdentificationIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface PetCardProps {
  pet: Pet;
  onUpdate: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onUpdate, showToast }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase.from('pets').delete().eq('id', pet.id);
      if (error) throw error;
      showToast('Your furry friend has been removed from the list 🌈', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error deleting pet:', error);
      showToast('Oops! We couldn\'t delete your pet. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleEdit = () => {
    showToast('Edit feature coming soon! 🎨', 'success');
  };

  const getRandomEmoji = () => {
    const emojis = ['🐶', '🐱', '🐰', '🐦', '🐹', '🦊', '🐼', '🐨', '🦁', '🐯'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">{getRandomEmoji()}</span>
            <h2 className="text-xl font-bold text-white">{pet.name}</h2>
          </div>
          <HeartIcon className="h-6 w-6 text-white/80" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-gray-600">
            <CalendarIcon className="h-5 w-5 text-indigo-500" />
            <span>Age: {pet.age} years</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <IdentificationIcon className="h-5 w-5 text-purple-500" />
            <span>Breed: {pet.breed}</span>
          </div>

          {pet.description && (
            <div className="flex items-start space-x-2 text-gray-600">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-pink-500 mt-1" />
              <p className="text-sm">{pet.description}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-4">
          <button
            onClick={handleEdit}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 
                     border border-transparent rounded-full text-sm font-medium 
                     text-white bg-gradient-to-r from-indigo-500 to-blue-500 
                     hover:from-indigo-600 hover:to-blue-600 
                     transition-all duration-200 ease-in-out transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex-1 inline-flex items-center justify-center px-4 py-2 
                     border border-transparent rounded-full text-sm font-medium 
                     transition-all duration-200 ease-in-out transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                     ${showConfirmDelete 
                       ? 'text-white bg-red-500 hover:bg-red-600' 
                       : 'text-red-500 bg-red-50 hover:bg-red-100'
                     }`}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : showConfirmDelete ? 'Confirm' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetCard;