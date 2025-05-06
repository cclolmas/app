import React from 'react';
import { Box, Grid, Typography, Paper, Divider, IconButton, Tooltip } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const ComparisonView = ({ items, isComparisonView, toggleComparisonView }) => {
  // If not in comparison view, render items in a list
  if (!isComparisonView || items.length < 2) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Tooltip title="Toggle Side-by-Side Comparison">
            <IconButton 
              onClick={toggleComparisonView}
              color={isComparisonView ? "primary" : "default"}
              disabled={items.length < 2}
            >
              <CompareArrowsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          {items.map((item, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>{item.content}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  // In comparison view, render items side-by-side
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title="Toggle Side-by-Side Comparison">
          <IconButton 
            onClick={toggleComparisonView}
            color={isComparisonView ? "primary" : "default"}
          >
            <CompareArrowsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Grid container spacing={2}>
        {items.map((item, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper sx={{ 
              p: 2, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6">{item.title}</Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Typography>{item.content}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ComparisonView;
