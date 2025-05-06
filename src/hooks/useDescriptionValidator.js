import { useState, useEffect } from 'react';
import { validateDescription, suggestImprovedDescription } from '../utils/descriptionValidator';

/**
 * Custom hook to validate and provide feedback for problem descriptions
 * @param {string} initialDescription - The initial description to validate
 * @returns {Object} - Validation state and helper functions
 */
const useDescriptionValidator = (initialDescription = '') => {
  const [description, setDescription] = useState(initialDescription);
  const [validation, setValidation] = useState({ isValid: true, message: '', suggestions: [] });
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Add delay to avoid validating on every keystroke
    const timer = setTimeout(() => {
      setValidation(validateDescription(description));
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [description]);

  const validateNow = () => {
    setIsValidating(true);
    setValidation(validateDescription(description));
    setIsValidating(false);
    return validation.isValid;
  };

  const getSuggestion = () => {
    return suggestImprovedDescription(description);
  };

  return {
    description,
    setDescription,
    validation,
    isValidating,
    validateNow,
    getSuggestion
  };
};

export default useDescriptionValidator;
