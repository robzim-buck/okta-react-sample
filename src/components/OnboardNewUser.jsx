import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Container, Paper, Box, CircularProgress, Alert,
  TextField, Button, Grid, Snackbar, MenuItem, Select, InputLabel,
  FormControl, FormHelperText
} from '@mui/material';
import { useOktaAuth } from '@okta/okta-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiGet } from '../hooks/useApi';

export default function OnboardNewUser() {
  const { authState } = useOktaAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    login: '',
    mobilePhone: '',
    status: 'STAGED'
  });
  const [errors, setErrors] = useState({});
  const [userExists, setUserExists] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle', 'checking', 'valid', 'invalid'

  // Fetch Okta users for email validation
  const oktaUsersQuery = useApiGet('/buckokta/category/att/comparison/match', {
    queryParams: { _category: 'users' },
    queryConfig: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Create an email lookup map for fast validation
  const emailLookup = useMemo(() => {
    if (!oktaUsersQuery.data || !Array.isArray(oktaUsersQuery.data)) {
      return {};
    }

    const emailMap = {};
    oktaUsersQuery.data.forEach(user => {
      // Check both email and login fields since either could be what we need to validate against
      if (user.profile?.email) {
        emailMap[user.profile.email.toLowerCase()] = user;
      }
      if (user.profile?.login) {
        emailMap[user.profile.login.toLowerCase()] = user;
      }
    });

    return emailMap;
  }, [oktaUsersQuery.data]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to check if a user exists by login
  const checkUserExists = async (login) => {
    if (!login || !login.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(login)) {
      setEmailStatus('idle');
      setEmailValidated(false);
      setUserExists(false);
      return false; // Don't check if login is empty or invalid
    }

    setCheckingUser(true);
    setEmailStatus('checking');
    setEmailValidated(false);

    try {
      // For testing/demonstration purposes, simulate checking against a server
      // In a real app, this would be a real API call to check if the user exists
      // Mock response for demonstration - assume user doesn't exist for now
      // This lets the Create User button become active when a valid email is entered

      // If Okta users are still loading, wait a moment
      if (oktaUsersQuery.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (oktaUsersQuery.isLoading) {
          throw new Error("Still loading Okta users");
        }
      }

      // Check if the email exists in the lookup map
      const normalizedEmail = login.toLowerCase();
      const exists = !!emailLookup[normalizedEmail];

      // For debugging
      console.log(`Checking email ${normalizedEmail}: ${exists ? 'EXISTS' : 'does not exist'}`);

      setUserExists(exists);
      setEmailStatus(exists ? 'invalid' : 'valid');
      setEmailValidated(true);
      return exists;
    } catch (error) {
      console.error('Error checking user existence:', error);
      setEmailStatus('idle');
      setEmailValidated(false);
      return false;
    } finally {
      setCheckingUser(false);
    }
  };

  // Create user mutation with query params support
  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      const endpoint = '/buckokta_create_user' + data.queryString;
      const url = `https://laxcoresrv.buck.local:8000${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body for POST request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response.text();
    },
    onSuccess: (data) => {
      setSnackbar({
        open: true,
        message: 'User created successfully!',
        severity: 'success'
      });
      // Reset form after successful creation
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        login: '',
        mobilePhone: '',
        status: 'STAGED'
      });
      setErrors({});
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error creating user: ${error.message}`,
        severity: 'error'
      });
    }
  });

  // Add debounce to prevent too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounced version of checkUserExists
  const debouncedCheckUser = debounce(async (login) => {
    await checkUserExists(login);
  }, 500);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Check if user exists when login field changes
    if (name === 'login' && value.trim() !== '') {
      debouncedCheckUser(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.login.trim()) {
      newErrors.login = 'Login is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.login)) {
      newErrors.login = 'Login must be a valid email address';
    } else if (userExists) {
      newErrors.login = 'This user already exists. Please use a different login.';
    }

    if (!formData.mobilePhone.trim()) {
      newErrors.mobilePhone = 'Mobile phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobilePhone.replace(/[^0-9]/g, ''))) {
      newErrors.mobilePhone = 'Mobile phone must contain 10 digits';
    }

    setErrors(newErrors);
    // Only allow form submission if there are no errors and email is either empty or validated as unique
    return Object.keys(newErrors).length === 0 &&
           (formData.login.trim() === '' || (emailValidated && emailStatus === 'valid')) &&
           !checkingUser;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format phone number to only include digits
    const formattedPhone = formData.mobilePhone.replace(/[^0-9]/g, '');

    // Build query string manually
    const queryString = `?login=${encodeURIComponent(formData.login)}`
      + `&first_name=${encodeURIComponent(formData.firstName)}`
      + `&last_name=${encodeURIComponent(formData.lastName)}`
      + `&mobile_phone=${encodeURIComponent(formattedPhone)}`;

    // Call mutation to create user with the endpoint plus query string
    createUserMutation.mutate({
      queryString: queryString
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (createUserMutation.isLoading) {
    return (
      <Box>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          Onboard New User
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
        Onboard New User
      </Typography>

      {authState ? (
        <Alert severity={authState.isAuthenticated ? "success" : "warning"} sx={{ mb: 2 }}>
          Authentication Status: {authState.isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Authentication state is loading...
        </Alert>
      )}

      {oktaUsersQuery.isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading Okta users for email validation...
        </Alert>
      )}

      {oktaUsersQuery.error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Error loading Okta users. Email validation may not be accurate.
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item size={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
              />
            </Grid>

            <Grid item size={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
              />
            </Grid>
            
            <Grid item size={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid item size={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Login (Username - must be email format)"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  error={!!errors.login || emailStatus === 'invalid'}
                  helperText={
                    emailStatus === 'invalid'
                      ? "This user already exists. Please use a different login."
                      : (errors.login || "Login must be a valid email address")
                  }
                  required
                  InputProps={{
                    endAdornment: checkingUser && (
                      <CircularProgress size={20} sx={{ marginRight: 1 }} />
                    ),
                    sx: {
                      ...(emailStatus === 'valid' && {
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(46, 125, 50, 0.15)'
                        }
                      }),
                      ...(emailStatus === 'invalid' && {
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.15)'
                        }
                      })
                    }
                  }}
                />
                {!checkingUser && emailValidated && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: emailStatus === 'valid' ? 'success.main' : 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  />
                )}
              </Box>
            </Grid>

            <Grid item size={12}>
              <TextField
                fullWidth
                label="Mobile Phone"
                name="mobilePhone"
                value={formData.mobilePhone}
                onChange={handleChange}
                error={!!errors.mobilePhone}
                helperText={errors.mobilePhone || "Format: 10 digits (e.g., 1234567890)"}
                required
              />
            </Grid>

            <Grid item size={12}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value="STAGED">Staged</MenuItem>
                  <MenuItem value="PROVISIONED">Provisioned</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                </Select>
                <FormHelperText>
                  Initial status for the new user
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={
                    createUserMutation.isLoading ||
                    emailStatus === 'invalid' ||
                    checkingUser ||
                    oktaUsersQuery.isLoading ||
                    (formData.login.trim() !== '' && !emailValidated)
                  }
                >
                  {oktaUsersQuery.isLoading
                    ? 'Loading Users...'
                    : checkingUser
                      ? 'Checking...'
                      : emailStatus === 'invalid'
                        ? 'User Already Exists'
                        : emailValidated && emailStatus === 'valid'
                          ? 'Create User'
                          : 'Enter Valid Email'
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}