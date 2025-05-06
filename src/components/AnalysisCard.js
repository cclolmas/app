import React, { useState } from 'react';
import { Card, ListGroup, Icon } from 'react-bootstrap';
import Link from 'next/link';
import { FaBrain, FaMicrochip, FaExchangeAlt } from 'react-icons/fa';

const AnalysisCard = ({ title, description, icon, color, visualizations }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getIcon = () => {
    switch(icon) {
      case 'brain': return <FaBrain size={32} />;
      case 'cpu': return <FaMicrochip size={32} />;
      case 'compare': return <FaExchangeAlt size={32} />;
      default: return null;
    }
  };
  
  return (
    <Card 
      className="analysis-card h-100" 
      style={{ borderTop: `4px solid ${color}` }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <Card.Body>
        <div className="icon-wrapper" style={{ backgroundColor: color }}>
          {getIcon()}
        </div>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{description}</Card.Text>
        
        <div className={`visualization-links ${expanded ? 'show' : ''}`}>
          <p className="fw-bold">Visualizações:</p>
          <ListGroup variant="flush">
            {visualizations.map((vis) => (
              <ListGroup.Item key={vis.id} className="border-0 ps-0">
                <Link href={`/analysis/${vis.id}`}>
                  <a className="vis-link">{vis.title}</a>
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-0">
        <Link href={`/analysis/${icon}`}>
          <a className="btn btn-outline-primary btn-sm w-100">Ver todas as análises</a>
        </Link>
      </Card.Footer>
    </Card>
  );
};

export default AnalysisCard;
