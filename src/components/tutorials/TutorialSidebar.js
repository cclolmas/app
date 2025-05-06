import React, { useState, useEffect } from 'react';
import { fetchTutorials } from '../../services/tutorialService';
import './TutorialSidebar.css';

const TutorialSidebar = ({ onSelectTutorial, isOpen, onClose }) => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadTutorials = async () => {
      try {
        const data = await fetchTutorials();
        setTutorials(data);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tutorials:', error);
        setLoading(false);
      }
    };
    
    loadTutorials();
  }, []);

  const filterTutorials = () => {
    if (activeCategory === 'all') return tutorials;
    return tutorials.filter(tutorial => tutorial.category === activeCategory);
  };

  return (
    <div className={`tutorial-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Tutoriais & Exemplos</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="category-filter">
        {categories.map(category => (
          <button 
            key={category}
            className={`category-btn ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading">Carregando tutoriais...</div>
      ) : (
        <div className="tutorial-list">
          {filterTutorials().map(tutorial => (
            <div 
              key={tutorial.id} 
              className="tutorial-item"
              onClick={() => onSelectTutorial(tutorial)}
            >
              <h3>{tutorial.title}</h3>
              <p>{tutorial.description}</p>
              <span className="difficulty-badge" data-level={tutorial.difficulty}>
                {tutorial.difficulty}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorialSidebar;
