import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Divider,
  alpha,
  Grid,
  CircularProgress
} from '@mui/material';
import taskApi from '../api/taskApi';
import Moment from 'moment';
import { Link } from 'react-router-dom';

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',
  mediumGreen: '#3F4F44',
  warmBrown: '#A27B5C',
  lightBeige: '#DCD7C9',
};

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getAssignedTasks();
        setTasks(response);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch assigned tasks:", error);
        setLoading(false);
      }
    };
    
    fetchAssignedTasks();
  }, []);
  
  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.darkGreen, fontWeight: 600 }}>
        My Assigned Tasks
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: theme.warmBrown }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Card sx={{ 
          p: 4, 
          mt: 2, 
          bgcolor: theme.lightBeige, 
          textAlign: 'center',
          boxShadow: `0 4px 8px ${alpha(theme.darkGreen, 0.1)}` 
        }}>
          <Typography variant="body1" color={theme.darkGrey}>
            You don't have any assigned tasks yet.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.lightBeige,
                boxShadow: `0 4px 8px ${alpha(theme.darkGreen, 0.1)}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 16px ${alpha(theme.darkGreen, 0.15)}`
                },
                borderLeft: `4px solid ${theme.warmBrown}`
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ 
                    color: theme.darkGreen,
                    fontWeight: 600,
                    mb: 1
                  }}>
                    {task.title || "Untitled Task"}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {task.content ? (
                      <div dangerouslySetInnerHTML={{ __html: task.content.substring(0, 100) + (task.content.length > 100 ? '...' : '') }} />
                    ) : (
                      "No description"
                    )}
                  </Typography>
                  
                  <Divider sx={{ my: 1, bgcolor: alpha(theme.warmBrown, 0.3) }} />
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={task.section?.title || "Unknown Section"} 
                      sx={{ 
                        bgcolor: alpha(theme.mediumGreen, 0.1),
                        color: theme.mediumGreen,
                        fontWeight: 500
                      }}
                      size="small"
                    />
                    <Typography variant="caption" color={alpha(theme.warmBrown, 0.9)}>
                      {Moment(task.updatedAt).format('MMM D, YYYY')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssignedTasks;
