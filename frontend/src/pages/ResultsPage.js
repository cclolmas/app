import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import ComparisonView from '../components/ComparisonView';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparisonView, setIsComparisonView] = useState(false);

  useEffect(() => {
    // Fetch results logic here
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/results');
        const data = await response.json();
        setResults(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  const toggleComparisonView = () => {
    setIsComparisonView(!isComparisonView);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debate Results
        </Typography>
        
        {isLoading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : (
          <ComparisonView 
            items={results} 
            isComparisonView={isComparisonView}
            toggleComparisonView={toggleComparisonView}
          />
        )}
      </Box>
    </Container>
  );
};

export default ResultsPage;