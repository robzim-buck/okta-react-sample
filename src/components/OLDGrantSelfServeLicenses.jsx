import axios from 'axios';
// Import specific MUI components for better tree shaking
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import uuid from 'react-uuid';

const endpoint = 'https://laxcoresrv.buck.local:8000'


export default function GrantSelfServeLicenses(props) {
    const [successvisible, setSuccessvisible] = useState(false);
    const [previsible, setPrevisible] = useState(false);
    const [product, setProduct] = useState('');
    const [operation, setOperation] = useState('');
    const [user, setUser] = useState('');
    const [expandedUsers, setExpandedUsers] = useState({});
    const [filter, setFilter] = useState('');
    
    // Toggle user expansion
    const toggleUserExpand = (userId) => {
      setExpandedUsers(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
    };

    const PreviewAlert = () => {
        if (previsible) {
            return(<>
              {}
              <Snackbar sx={{minWidth: 1400}} anchorOrigin={{vertical: 'top', horizontal: 'left'}} open={previsible} onClose={() => setPrevisible(false)}>
              <Alert sx={{minWidth: 1400}} action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="large"
                  onClick={() => {
                    setPrevisible(false)}}>
                  <AlertTitle>Processing...</AlertTitle>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              } severity="info">
                {operation} {product} License for {user}
              </Alert>
              </Snackbar>
              </>
            )
          }
      }
      
    
      const SuccessAlert = () => {
        if (successvisible) {
            return(<>
              {}
              <Snackbar sx={{minWidth: 1400}} anchorOrigin={{vertical: 'top', horizontal: 'left'}} open={successvisible} onClose={() => setSuccessvisible(false)}  autoHideDuration={3000} >
              <Alert sx={{minWidth: 1400}} action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="large"
                  onClick={() => {
                    setSuccessvisible(false);
                  }}>
                    <AlertTitle>Success!</AlertTitle>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }  icon={<CheckIcon fontSize="inherit" />} severity="success">
                Success {operation} {product} for {user}!
              </Alert>
    
              </Snackbar>
              </>
            )
          }
      }
      
    

  function grabLicense(event, useremail, license) {
    if ( ! useremail.includes('buck.co') && ! useremail.includes('anyways.co') && ! useremail.includes('giantant.ca') ) {
      alert(`Only works for Buck, GiantAnt and Anyways Users, not for ${useremail}`)
      return
    }
    setOperation('Grabbing');
    setPrevisible(true)
    setProduct(license);
    setUser(useremail);

    // Create a new XMLHttpRequest for direct communication
    const xhr = new XMLHttpRequest();
    const url = `${endpoint}/get_self_service_license?product=${license.toLowerCase()}&email=${useremail}`;

    xhr.open('POST', url, true);
    // xhr.setRequestHeader('x-token', 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.withCredentials = false; // Changed to false to avoid CORS credentials issue

    xhr.onload = function() {
      setPrevisible(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        // Check for 'success' in the response data
        if (xhr.responseText === 'success' || xhr.responseText.includes('success')) {
          setSuccessvisible(true);
        } else {
          alert(`Error: ${xhr.responseText}`);
        }
      } else {
        console.error("License request error:", xhr.statusText);
        alert(`Error requesting license: ${xhr.statusText}`);
      }
    };

    xhr.onerror = function() {
      setPrevisible(false);
      console.error("License request failed");
      alert("Error requesting license. Network error or CORS issue.");
    };

    xhr.send(JSON.stringify({}));
  }

    
    const [oktausers] = useQueries({
        queries: [
          {
            queryKey: ["oktausers"],
            queryFn: async () => {
              return new Promise((resolve, reject) => {
                try {
                  const xhr = new XMLHttpRequest();
                  xhr.open('GET', `${endpoint}/buckokta/category/att/comparison/match?_category=users`, true);
                  // xhr.setRequestHeader('x-token', 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo');
                  xhr.setRequestHeader('Content-Type', 'application/json');
                  xhr.setRequestHeader('Accept', 'application/json');
                  xhr.withCredentials = false; // Changed to false to avoid CORS credentials issue

                  xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                      const data = JSON.parse(xhr.responseText);
                      resolve(data);
                    } else {
                      reject(new Error(`HTTP error! Status: ${xhr.status}`));
                    }
                  };

                  xhr.onerror = function() {
                    console.error("Error fetching users");
                    reject(new Error("Network error occurred"));
                  };

                  xhr.send();
                } catch (error) {
                  console.error("Error fetching users:", error);
                  reject(error);
                }
              });
            },
            retry: 2,
            retryDelay: 1000,
        },
        ]
    });
    
    // Loading state
    if (oktausers.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      );
    }
    
    // Error state
    if (oktausers.error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <AlertTitle>Error</AlertTitle>
          An error has occurred: {oktausers.error.message}
        </Alert>
      );
    }
    
    // No data state
    if (oktausers.data === null || oktausers.data === undefined || (Array.isArray(oktausers.data) && oktausers.data.length === 0)) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
            {props.name}
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>No Users Found</AlertTitle>
            No user data is available. The API returned an empty response.
          </Alert>
        </Box>
      );
    }
    
    // Data state
    if (oktausers.data) {
      try {
        const handleClearFilter = () => {
          setFilter('');
        }
      
      // Get user initials for avatar
      const getUserInitials = (user) => {
        const firstName = user.profile?.firstName || '';
        const lastName = user.profile?.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName[0]}${lastName[0]}`.toUpperCase();
        } else if (firstName) {
          return firstName[0].toUpperCase();
        } else if (lastName) {
          return lastName[0].toUpperCase();
        } else {
          return 'U';
        }
      };
      
      // Validate and sort data
      let validData = Array.isArray(oktausers.data) ? oktausers.data : [];
      
      // Filter out any objects without profile or login
      validData = validData.filter(user => 
        user && user.profile && user.profile.login
      );
      
      // Sort data
      let sortedData = validData.sort((a, b) => 
        a.profile.login.localeCompare(b.profile.login)
      );
      
      let filteredData = sortedData;
      if (filter.length > 0) {
        filteredData = sortedData.filter(user => 
          user.profile.login.toLowerCase().includes(filter.toLowerCase()) ||
          (user.profile.displayName && user.profile.displayName.toLowerCase().includes(filter.toLowerCase())) ||
          (user.profile.firstName && user.profile.firstName.toLowerCase().includes(filter.toLowerCase())) ||
          (user.profile.lastName && user.profile.lastName.toLowerCase().includes(filter.toLowerCase()))
        );
      }
      
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
            {props.name} 
            <Typography component="span" variant="subtitle1" sx={{ ml: 1 }}>
              ({filteredData.length} Users)
            </Typography>
          </Typography>
          
          <PreviewAlert />
          <SuccessAlert />
          
          {/* Search Bar */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filter && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearFilter}>
                      <ClearAllIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          {/* User List */}
          <Grid container spacing={2}>
            {filteredData.map((user) => {
              const isExpanded = expandedUsers[user.id] || false;
              const userInitials = getUserInitials(user);
              
              return (
                <Grid item xs={12} key={user.id || uuid()}>
                  <Card variant="outlined" sx={{ mb: 1 }}>
                    <CardContent sx={{ p: 2 }}>
                      {/* User summary - always visible */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleUserExpand(user.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {userInitials}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {user.profile?.displayName || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.profile?.email || user.profile?.login || 'No email information'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUserExpand(user.id);
                          }}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      
                      {/* Expandable license buttons */}
                      <Collapse in={isExpanded}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Grant License to {user.profile?.firstName || 'User'}
                        </Typography>
                        <Grid container spacing={1} columns={12}>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Adobe')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Adobe
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Acrobat')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Acrobat
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Aquarium')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Aquarium
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Maya')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Maya
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Substance')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Substance
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Parsec')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Parsec
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'MSO365')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Office
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Figma')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Figma
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'Figjam')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              Figjam
                            </Button>
                          </Grid>
                          <Grid item xs={6} sm={4} md={3} lg={2}>
                            <Button 
                              onClick={(e) => {grabLicense(e, user.profile.login, 'FigmaFigjam')}} 
                              size="small" 
                              variant="contained" 
                              fullWidth
                            >
                              FigmaFigjam
                            </Button>
                          </Grid>
                        </Grid>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {/* No results */}
          {filteredData.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users match your search
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleClearFilter}
                startIcon={<ClearAllIcon />}
                sx={{ mt: 2 }}
              >
                Clear Search
              </Button>
            </Box>
          )}
        </Box>
      );
      } catch (error) {
        console.error("Error processing data:", error);
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
              {props.name}
            </Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Error Processing Data</AlertTitle>
              There was an error processing the user data. Please try refreshing the page.
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Error details: {error.message}
              </Typography>
            </Alert>
          </Box>
        );
      }
    }
}


