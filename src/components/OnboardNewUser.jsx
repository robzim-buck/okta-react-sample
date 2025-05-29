import { useState, useMemo } from 'react';
// Import specific components for better tree shaking
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useOktaAuth } from '@okta/okta-react';
import { useMutation } from '@tanstack/react-query';
import { useProtectedApiGet } from '../hooks/useApi';

export default function OnboardNewUser() {
  const { authState } = useOktaAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    login: '',
    mobilePhone: '',
    status: 'STAGED',
    department: '',
    subsidiary: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [userExists, setUserExists] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle', 'checking', 'valid', 'invalid'
  const [showGoogleUsers, setShowGoogleUsers] = useState(false);
  const [showOktaUsers, setShowOktaUsers] = useState(false);
  const [googleSearchTerm, setGoogleSearchTerm] = useState('');
  const [oktaSearchTerm, setOktaSearchTerm] = useState('');

  // Fetch Okta users for email validation
  const oktaUsersQuery = useProtectedApiGet('/buckokta/category/att/comparison/match', {
    queryParams: { _category: 'users' },
    queryConfig: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Fetch Google staff users
  const googleStaffUsersQuery = useProtectedApiGet('/google/buckgoogleusers', {
    queryParams: { status: 'active', emp_type: 'Staff' },
    queryConfig: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Fetch Google freelance users
  const googleFreelanceUsersQuery = useProtectedApiGet('/google/buckgoogleusers', {
    queryParams: { status: 'active', emp_type: 'Freelance' },
    queryConfig: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Fetch NetSuite departments
  const departmentsQuery = useProtectedApiGet('/netsuite/departments', {
    queryConfig: {
      staleTime: 10 * 60 * 1000, // 10 minutes - departments don't change often
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Fetch NetSuite subsidiaries
  const subsidiariesQuery = useProtectedApiGet('/netsuite/subsidiaries', {
    queryConfig: {
      staleTime: 10 * 60 * 1000, // 10 minutes - subsidiaries don't change often
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Fetch NetSuite locations
  const locationsQuery = useProtectedApiGet('/netsuite/locations', {
    queryConfig: {
      staleTime: 10 * 60 * 1000, // 10 minutes - locations don't change often
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Combine and process Google users data
  const googleUsers = useMemo(() => {
    if (googleStaffUsersQuery.isLoading || googleFreelanceUsersQuery.isLoading) {
      return [];
    }

    if (googleStaffUsersQuery.error || googleFreelanceUsersQuery.error) {
      return [];
    }

    const staffData = Array.isArray(googleStaffUsersQuery.data) ? googleStaffUsersQuery.data : [];
    const freelanceData = Array.isArray(googleFreelanceUsersQuery.data) ? googleFreelanceUsersQuery.data : [];

    return [...staffData, ...freelanceData];
  }, [googleStaffUsersQuery.data, googleFreelanceUsersQuery.data,
      googleStaffUsersQuery.isLoading, googleFreelanceUsersQuery.isLoading,
      googleStaffUsersQuery.error, googleFreelanceUsersQuery.error]);

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

  // Get user initials for avatar fallback
  const getUserInitials = (user) => {
    if (user.profile) {
      // Okta user format
      const firstName = user.profile.firstName || '';
      const lastName = user.profile.lastName || '';
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      } else if (firstName) {
        return firstName[0].toUpperCase();
      } else if (lastName) {
        return lastName[0].toUpperCase();
      }
    } else if (user.name) {
      // Google user format
      const firstName = user.name.givenName || '';
      const lastName = user.name.familyName || '';
      if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
      } else if (firstName) {
        return firstName[0].toUpperCase();
      } else if (lastName) {
        return lastName[0].toUpperCase();
      }
    }
    return 'U';
  };

  // Filter functions for user lists
  const filteredGoogleUsers = useMemo(() => {
    if (!googleSearchTerm) return googleUsers;
    return googleUsers.filter(user => {
      const searchableFields = [
        user.name?.fullName,
        user.name?.givenName,
        user.name?.familyName,
        user.primaryEmail,
        user.organizations?.[0]?.title,
        user.organizations?.[0]?.department
      ];
      return searchableFields.some(field => 
        field && field.toLowerCase().includes(googleSearchTerm.toLowerCase())
      );
    });
  }, [googleUsers, googleSearchTerm]);

  const filteredOktaUsers = useMemo(() => {
    if (!Array.isArray(oktaUsersQuery.data)) return [];
    const users = oktaUsersQuery.data;
    if (!oktaSearchTerm) return users;
    return users.filter(user => {
      const searchableFields = [
        user.profile?.firstName,
        user.profile?.lastName,
        user.profile?.email,
        user.profile?.login,
        user.profile?.title
      ];
      return searchableFields.some(field => 
        field && field.toLowerCase().includes(oktaSearchTerm.toLowerCase())
      );
    });
  }, [oktaUsersQuery.data, oktaSearchTerm]);

  // Function to find Google photo for Okta user
  const getGooglePhotoForOktaUser = (oktaUser) => {
    if (!oktaUser.profile?.email) return null;
    
    // Find matching Google user by email
    const matchingGoogleUser = googleUsers.find(googleUser => {
      return googleUser.primaryEmail && 
             googleUser.primaryEmail.toLowerCase() === oktaUser.profile.email.toLowerCase();
    });
    
    return matchingGoogleUser?.thumbnailPhotoUrl || null;
  };
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to check if a user exists by login
  const checkUserExists = async (login) => {
    if (!login || !login.trim()) {
      setEmailStatus('idle');
      setEmailValidated(false);
      setUserExists(false);
      return false; // Don't check if login is empty
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
    onSuccess: () => {
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
        status: 'STAGED',
        department: '',
        subsidiary: '',
        location: ''
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

    // Trim spaces from first name and last name fields
    const trimmedValue = (name === 'firstName' || name === 'lastName') ? value.trim() : value;

    let updatedFormData = {
      ...formData,
      [name]: trimmedValue
    };

    // Automatically construct email and login when first or last name changes
    if (name === 'firstName' || name === 'lastName') {
      // Use the updated form data to get the current values (including the field being changed)
      const firstName = name === 'firstName' ? trimmedValue : (formData.firstName ? formData.firstName.trim() : '');
      const lastName = name === 'lastName' ? trimmedValue : (formData.lastName ? formData.lastName.trim() : '');

      console.log('Debug clearing:', {
        name,
        originalValue: value,
        trimmedValue,
        firstName,
        lastName,
        firstNameEmpty: !firstName,
        lastNameEmpty: !lastName,
        shouldClear: !firstName || !lastName
      });

      // Update email and login based on name availability
      if (firstName && lastName) {
        // Create lowercase versions for email and login
        const firstNameLower = firstName.toLowerCase();
        const lastNameLower = lastName.toLowerCase();

        // Construct email and login
        const email = `${firstNameLower}.${lastNameLower}@buck.co`;
        const login = `${firstNameLower}.${lastNameLower}`;

        console.log('Setting email and login:', { email, login });

        updatedFormData = {
          ...updatedFormData,
          email: email,
          login: login
        };
      } else {
        // Clear email and login if either first or last name is empty
        console.log('Clearing email and login');
        updatedFormData = {
          ...updatedFormData,
          email: '',
          login: ''
        };
      }
    }

    setFormData(updatedFormData);

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Check if user exists when email field changes
    if ((name === 'email' && value.trim() !== '') ||
        (name === 'firstName' || name === 'lastName')) {
      if (updatedFormData.email && updatedFormData.email.trim() !== '') {
        debouncedCheckUser(updatedFormData.email);
      }
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
    } else if (userExists) {
      newErrors.email = 'This user already exists. Please use a different name.';
    }

    if (!formData.login.trim()) {
      newErrors.login = 'Login is required';
    }

    if (!formData.mobilePhone.trim()) {
      newErrors.mobilePhone = 'Mobile phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobilePhone.replace(/[^0-9]/g, ''))) {
      newErrors.mobilePhone = 'Mobile phone must contain 10 digits';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.subsidiary.trim()) {
      newErrors.subsidiary = 'Subsidiary is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    // Only allow form submission if there are no errors and email is either empty or validated as unique
    return Object.keys(newErrors).length === 0 &&
           (formData.email.trim() === '' || (emailValidated && emailStatus === 'valid')) &&
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

      {departmentsQuery.isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading departments from NetSuite...
        </Alert>
      )}

      {departmentsQuery.error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Error loading departments. Please try refreshing the page.
        </Alert>
      )}

      {subsidiariesQuery.isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading subsidiaries from NetSuite...
        </Alert>
      )}

      {subsidiariesQuery.error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Error loading subsidiaries. Please try refreshing the page.
        </Alert>
      )}

      {locationsQuery.isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading locations from NetSuite...
        </Alert>
      )}

      {locationsQuery.error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Error loading locations. Please try refreshing the page.
        </Alert>
      )}

      {/* Google Users Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Google Users ({googleUsers.length} users)
          </Typography>
          <IconButton
            onClick={() => setShowGoogleUsers(!showGoogleUsers)}
            aria-label={showGoogleUsers ? 'collapse' : 'expand'}
          >
            {showGoogleUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={showGoogleUsers}>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Search Google users..."
              size="small"
              fullWidth
              value={googleSearchTerm}
              onChange={(e) => setGoogleSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Box>
          
          {googleStaffUsersQuery.isLoading || googleFreelanceUsersQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Name</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Email</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Title</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Department</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredGoogleUsers.slice(0, 50).map((user) => {
                    const isFreelancer = user.organizations && 
                                        user.organizations[0]?.costCenter && 
                                        user.organizations[0].costCenter.toLowerCase() === 'freelance';
                    
                    return (
                      <TableRow key={user.id || user.primaryEmail}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              src={user.thumbnailPhotoUrl || undefined}
                              alt={getUserInitials(user)}
                              slotProps={{
                                img: {
                                  loading: "lazy",
                                  referrerPolicy: "no-referrer",
                                  onError: (e) => {
                                    e.target.style.display = 'none';
                                  }
                                }
                              }}
                              sx={{
                                width: 32,
                                height: 32,
                                border: isFreelancer
                                  ? '2px solid #f50057'
                                  : '2px solid #8c9eff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                bgcolor: isFreelancer ? '#f50057' : 'primary.main',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {!user.thumbnailPhotoUrl && getUserInitials(user)}
                            </Avatar>
                            <Box>
                              {user.name?.fullName || 
                                `${user.name?.givenName || ''} ${user.name?.familyName || ''}`}
                              {isFreelancer && (
                                <Chip 
                                  label="Freelance" 
                                  size="small" 
                                  color="error" 
                                  variant="outlined"
                                  sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{user.primaryEmail || 'N/A'}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{user.organizations?.[0]?.title || 'N/A'}</TableCell>
                        <TableCell>
                          {user.organizations?.[0]?.department ? (
                            <Chip 
                              label={user.organizations[0].department} 
                              color="primary" 
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 20 }}
                            />
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredGoogleUsers.length > 50 && (
                <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing first 50 of {filteredGoogleUsers.length} users
                  </Typography>
                </Box>
              )}
            </TableContainer>
          )}
        </Collapse>
      </Paper>

      {/* Okta Users Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Okta Users ({Array.isArray(oktaUsersQuery.data) ? oktaUsersQuery.data.length : 0} users)
          </Typography>
          <IconButton
            onClick={() => setShowOktaUsers(!showOktaUsers)}
            aria-label={showOktaUsers ? 'collapse' : 'expand'}
          >
            {showOktaUsers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={showOktaUsers}>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Search Okta users..."
              size="small"
              fullWidth
              value={oktaSearchTerm}
              onChange={(e) => setOktaSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Box>
          
          {oktaUsersQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Name</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Email/Login</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1 }}>Title</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOktaUsers.slice(0, 50).map((user) => (
                    <TableRow key={user.id || user.profile?.email}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={getGooglePhotoForOktaUser(user) || user.profile?.photo || undefined}
                            alt={getUserInitials(user)}
                            slotProps={{
                              img: {
                                loading: "lazy",
                                referrerPolicy: "no-referrer",
                                onError: (e) => {
                                  e.target.style.display = 'none';
                                }
                              }
                            }}
                            sx={{
                              bgcolor: 'secondary.main',
                              width: 32,
                              height: 32,
                              fontSize: '0.75rem',
                              border: getGooglePhotoForOktaUser(user) 
                                ? '2px solid #8c9eff' // Blue border if Google photo found
                                : '2px solid #9c27b0', // Purple border for Okta-only
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          >
                            {!(getGooglePhotoForOktaUser(user) || user.profile?.photo) && getUserInitials(user)}
                          </Avatar>
                          {`${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {user.profile?.email || user.profile?.login || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status || 'Unknown'} 
                          color={user.status === 'ACTIVE' ? 'success' : 'default'} 
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem', height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {user.profile?.title || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOktaUsers.length > 50 && (
                <Box sx={{ p: 1, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing first 50 of {filteredOktaUsers.length} users
                  </Typography>
                </Box>
              )}
            </TableContainer>
          )}
        </Collapse>
      </Paper>
      
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
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email || emailStatus === 'invalid'}
                  helperText={
                    emailStatus === 'invalid'
                      ? "This user already exists. Please use a different name."
                      : (errors.email || "Email generated from first.last@buck.co")
                  }
                  required
                  slotProps={{
                    input: {
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
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid item size={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Login (Username - automatically generated from name)"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  error={!!errors.login}
                  helperText={errors.login || "Username generated from first.last"}
                  required
                  slotProps={{
                    input: {
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
                    }
                  }}
                />
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
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: 'white',
                        color: 'black'
                      }
                    }
                  }}
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
              <FormControl fullWidth required error={!!errors.department}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  name="department"
                  value={formData.department}
                  label="Department"
                  onChange={handleChange}
                  disabled={departmentsQuery.isLoading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: 'white',
                        color: 'black',
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {departmentsQuery.isLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        Loading departments...
                      </Box>
                    </MenuItem>
                  ) : departmentsQuery.error ? (
                    <MenuItem disabled>
                      Error loading departments
                    </MenuItem>
                  ) : departmentsQuery.data && Array.isArray(departmentsQuery.data) ? (
                    departmentsQuery.data.map((dept) => (
                      <MenuItem key={dept.id || dept.name} value={dept.name || dept.id}>
                        {dept.name || dept.id}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No departments available
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {errors.department || 
                   (departmentsQuery.isLoading ? 'Loading departments...' : 
                    departmentsQuery.error ? 'Error loading departments' :
                    'Select the user\'s department')}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item size={12}>
              <FormControl fullWidth required error={!!errors.subsidiary}>
                <InputLabel id="subsidiary-label">Subsidiary</InputLabel>
                <Select
                  labelId="subsidiary-label"
                  name="subsidiary"
                  value={formData.subsidiary}
                  label="Subsidiary"
                  onChange={handleChange}
                  disabled={subsidiariesQuery.isLoading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: 'white',
                        color: 'black',
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {subsidiariesQuery.isLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        Loading subsidiaries...
                      </Box>
                    </MenuItem>
                  ) : subsidiariesQuery.error ? (
                    <MenuItem disabled>
                      Error loading subsidiaries
                    </MenuItem>
                  ) : subsidiariesQuery.data && Array.isArray(subsidiariesQuery.data) ? (
                    subsidiariesQuery.data.map((sub) => (
                      <MenuItem key={sub.id || sub.name} value={sub.name || sub.id}>
                        {sub.name || sub.id}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No subsidiaries available
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {errors.subsidiary || 
                   (subsidiariesQuery.isLoading ? 'Loading subsidiaries...' : 
                    subsidiariesQuery.error ? 'Error loading subsidiaries' :
                    'Select the user\'s subsidiary')}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item size={12}>
              <FormControl fullWidth required error={!!errors.location}>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={formData.location}
                  label="Location"
                  onChange={handleChange}
                  disabled={locationsQuery.isLoading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        backgroundColor: 'white',
                        color: 'black',
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {locationsQuery.isLoading ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        Loading locations...
                      </Box>
                    </MenuItem>
                  ) : locationsQuery.error ? (
                    <MenuItem disabled>
                      Error loading locations
                    </MenuItem>
                  ) : locationsQuery.data && Array.isArray(locationsQuery.data) ? (
                    locationsQuery.data.map((loc) => (
                      <MenuItem key={loc.id || loc.name} value={loc.name || loc.id}>
                        {loc.name || loc.id}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      No locations available
                    </MenuItem>
                  )}
                </Select>
                <FormHelperText>
                  {errors.location || 
                   (locationsQuery.isLoading ? 'Loading locations...' : 
                    locationsQuery.error ? 'Error loading locations' :
                    'Select the user\'s location')}
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
                    departmentsQuery.isLoading ||
                    subsidiariesQuery.isLoading ||
                    locationsQuery.isLoading ||
                    (formData.login.trim() !== '' && !emailValidated)
                  }
                >
                  {oktaUsersQuery.isLoading
                    ? 'Loading Users...'
                    : departmentsQuery.isLoading
                      ? 'Loading Departments...'
                      : subsidiariesQuery.isLoading
                        ? 'Loading Subsidiaries...'
                        : locationsQuery.isLoading
                          ? 'Loading Locations...'
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