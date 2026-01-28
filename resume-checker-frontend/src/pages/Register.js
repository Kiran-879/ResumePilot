// src/pages/Register.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'student',
    location: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Email validation rules
  const emailRules = [
    { label: 'Valid email format (e.g., user@example.com)', test: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) },
    { label: 'No spaces allowed', test: (email) => !/\s/.test(email) },
    { label: 'Must contain @ symbol', test: (email) => email.includes('@') },
    { label: 'Must have domain extension (e.g., .com, .org)', test: (email) => /\.[a-zA-Z]{2,}$/.test(email) }
  ];

  const isEmailValid = () => {
    return emailRules.every(rule => rule.test(formData.email));
  };

  // Password validation rules
  const passwordRules = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'At least one lowercase letter (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'At least one number (0-9)', test: (pwd) => /[0-9]/.test(pwd) },
    { label: 'At least one special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const isPasswordValid = () => {
    return passwordRules.every(rule => rule.test(formData.password));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email format
    if (!isEmailValid()) {
      setError('Email does not meet the required format');
      setLoading(false);
      return;
    }

    // Validate password format
    if (!isPasswordValid()) {
      setError('Password does not meet the required format');
      setLoading(false);
      return;
    }

    // Check passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    console.log('Registration result:', result);
    
    if (result.success) {
      navigate('/login');
    } else {
      // Handle different error formats
      if (typeof result.error === 'string') {
        setError(result.error);
      } else if (typeof result.error === 'object' && result.error !== null) {
        // Format object errors for display
        const errorMessages = [];
        for (const [key, value] of Object.entries(result.error)) {
          if (Array.isArray(value)) {
            errorMessages.push(`${key}: ${value.join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${value}`);
          }
        }
        setError(errorMessages.join(' | '));
      } else {
        setError('Registration failed. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Register
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof error === 'string' ? error : (
                Array.isArray(error) ? error.join(', ') :
                Object.entries(error).map(([key, value]) => (
                  <div key={key}><strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}</div>
                ))
              )}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              margin="normal"
              required
              error={formData.email.length > 0 && !isEmailValid()}
              helperText={formData.email.length > 0 && !isEmailValid() ? "Email doesn't meet requirements" : ""}
            />

            {/* Email Requirements */}
            {(emailFocused || (formData.email.length > 0 && !isEmailValid())) && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Email must:
                </Typography>
                <List dense disablePadding>
                  {emailRules.map((rule, index) => {
                    const passed = rule.test(formData.email);
                    return (
                      <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          {passed ? (
                            <CheckIcon fontSize="small" color="success" />
                          ) : (
                            <CloseIcon fontSize="small" color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={rule.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: passed ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="placement_team">Placement Team</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              margin="normal"
              required
              error={formData.password.length > 0 && !isPasswordValid()}
              helperText={formData.password.length > 0 && !isPasswordValid() ? "Password doesn't meet requirements" : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Password Requirements */}
            {(passwordFocused || formData.password.length > 0) && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Password must contain:
                </Typography>
                <List dense disablePadding>
                  {passwordRules.map((rule, index) => {
                    const passed = rule.test(formData.password);
                    return (
                      <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          {passed ? (
                            <CheckIcon fontSize="small" color="success" />
                          ) : (
                            <CloseIcon fontSize="small" color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={rule.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: passed ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
            
            <TextField
              fullWidth
              label="Confirm Password"
              name="password_confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.password_confirm}
              onChange={handleChange}
              margin="normal"
              required
              error={formData.password_confirm.length > 0 && formData.password !== formData.password_confirm}
              helperText={formData.password_confirm.length > 0 && formData.password !== formData.password_confirm ? "Passwords do not match" : ""}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !isEmailValid() || !isPasswordValid() || formData.password !== formData.password_confirm}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/login">
                Already have an account? Sign in
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;