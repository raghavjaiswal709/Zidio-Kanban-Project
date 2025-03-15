import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  FormControl,
  Select,
  MenuItem,
  alpha,
  CircularProgress
} from '@mui/material';
import authApi from '../../api/authApi';

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',
  mediumGreen: '#3F4F44',
  warmBrown: '#A27B5C',
  lightBeige: '#DCD7C9',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authApi.getAllUsers();
      setUsers(response);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleRoleChange = async (userId, newRole) => {
    try {
      await authApi.updateUserRole(userId, { role: newRole });
      // Update local state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
    } catch (error) {
      console.error("Failed to update user role:", error);
      alert("Failed to update user role. Please try again.");
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.darkGreen, fontWeight: 600 }}>
        User Management
      </Typography>
      
      <Paper sx={{ 
        p: 2, 
        mt: 2,
        bgcolor: theme.lightBeige,
        boxShadow: `0 4px 8px ${alpha(theme.darkGreen, 0.1)}` 
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress sx={{ color: theme.warmBrown }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.mediumGreen, 0.1) }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.darkGreen }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.darkGreen }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.darkGreen }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <FormControl variant="outlined" size="small">
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          sx={{ 
                            bgcolor: 'white',
                            minWidth: 120,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.mediumGreen,
                            }
                          }}
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="assignee">Assignee</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default UserManagement;
