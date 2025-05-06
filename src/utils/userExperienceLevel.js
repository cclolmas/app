/**
 * Níveis de experiência do usuário
 */
export const EXPERIENCE_LEVELS = {
  NOVICE: 'novice',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

/**
 * Verifica o nível de experiência do usuário atual
 * @returns {string} O nível de experiência do usuário
 */
export const getUserExperienceLevel = () => {
  // Obter do localStorage ou de um serviço de perfil de usuário
  const savedLevel = localStorage.getItem('userExperienceLevel');
  
  // Por padrão, novos usuários são considerados novatos
  return savedLevel || EXPERIENCE_LEVELS.NOVICE;
};

/**
 * Atualiza o nível de experiência do usuário
 * @param {string} level - O novo nível de experiência
 */
export const updateUserExperienceLevel = (level) => {
  if (Object.values(EXPERIENCE_LEVELS).includes(level)) {
    localStorage.setItem('userExperienceLevel', level);
    return true;
  }
  return false;
};

/**
 * Verifica se o usuário deve ver a interface simplificada
 * @returns {boolean} True se deve exibir interface simplificada
 */
export const shouldShowSimplifiedInterface = () => {
  const level = getUserExperienceLevel();
  return level === EXPERIENCE_LEVELS.NOVICE;
};
