// src/pages/Login.js
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
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  School as StudentIcon,
  Business as PlacementIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [loginType, setLoginType] = useState('student');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState(''); // 'username' or 'password'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (but not during login attempt)
  React.useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLoginTypeChange = (event, newType) => {
    if (newType !== null) {
      setLoginType(newType);
      setError('');
      setFieldError('');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear error for the field being edited
    if (fieldError === e.target.name) {
      setFieldError('');
      setError('');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldError('');

    try {
      // Include login_type in credentials
      const loginData = {
        ...credentials,
        login_type: loginType
      };
      const result = await login(loginData);
      
      console.log('Login result:', result);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Show error message
        const errorMsg = result.error || 'Incorrect username or password. Please try again.';
        console.log('Setting error:', errorMsg);
        setError(errorMsg);
        // Set field-specific error if provided
        if (result.field) {
          setFieldError(result.field);
        }
        setLoading(false);
      }
    } catch (err) {
      console.log('Login exception:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Resume Checker
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Login to continue
          </Typography>

          {/* Role Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom>
              I am a
            </Typography>
            <ToggleButtonGroup
              value={loginType}
              exclusive
              onChange={handleLoginTypeChange}
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton 
                value="student" 
                sx={{ 
                  py: 2,
                  flexDirection: 'column',
                  gap: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    }
                  }
                }}
              >
                <StudentIcon fontSize="large" />
                <Typography variant="body2">Student</Typography>
              </ToggleButton>
              <ToggleButton 
                value="placement_team"
                sx={{ 
                  py: 2,
                  flexDirection: 'column',
                  gap: 1,
                  '&.Mui-selected': {
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText',
                    '&:hover': {
                      bgcolor: 'secondary.main',
                    }
                  }
                }}
              >
                <PlacementIcon fontSize="large" />
                <Typography variant="body2">Placement Team</Typography>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Role Description */}
            <Card variant="outlined" sx={{ bgcolor: loginType === 'student' ? 'primary.50' : 'secondary.50' }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                {loginType === 'student' ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    📚 Upload your resume, browse jobs, and check your match scores
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    📊 Manage job postings, view all resumes, and analyze candidates
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontWeight: 'medium' }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              required
              error={fieldError === 'username'}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              error={fieldError === 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color={loginType === 'student' ? 'primary' : 'secondary'}
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : `Login as ${loginType === 'student' ? 'Student' : 'Placement Team'}`}
            </Button>
            
            <Box textAlign="center">
              <Link component={RouterLink} to="/register">
                Don't have an account? Sign up
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;