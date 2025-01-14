export const validatePet = (pet: {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
}) => {
  const errors: Record<string, string> = {};

  if (!pet.name.trim()) {
    errors.name = 'Pet name is required';
  }

  if (!pet.species) {
    errors.species = 'Species is required';
  }

  if (!pet.breed.trim()) {
    errors.breed = 'Breed is required';
  }

  const age = parseFloat(pet.age);
  if (isNaN(age) || age < 0) {
    errors.age = 'Please enter a valid age';
  }

  const weight = parseFloat(pet.weight);
  if (isNaN(weight) || weight <= 0) {
    errors.weight = 'Please enter a valid weight';
  }

  return errors;
};

export const validateProfile = (profile: {
  address: string;
  nif: string;
  birthDate: string;
}) => {
  const errors: Record<string, string> = {};

  if (!profile.address.trim()) {
    errors.address = 'Address is required';
  }

  if (!profile.nif.trim()) {
    errors.nif = 'NIF is required';
  } else if (!/^\d{9}$/.test(profile.nif)) {
    errors.nif = 'NIF must be 9 digits';
  }

  if (!profile.birthDate) {
    errors.birthDate = 'Birth date is required';
  } else {
    const date = new Date(profile.birthDate);
    const now = new Date();
    if (date > now) {
      errors.birthDate = 'Birth date cannot be in the future';
    }
  }

  return errors;
}; 