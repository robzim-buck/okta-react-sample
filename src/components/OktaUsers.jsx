import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import { 
  Typography, Box, Container, Grid,
  Card, CardContent, Chip, Divider,
  Paper, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Tooltip, IconButton, LinearProgress,
  Collapse, Button, Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  Email as EmailIcon,
  LocationCity as LocationCityIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  Event as EventIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import uuid from 'react-uuid';
import CircularProgress from '@mui/material/CircularProgress';

export default function OktaUsers(props) {
  // State for search and expanded items
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  
  // Copy text to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  // Fetch Okta users data
  const [oktausers] = useQueries({
    queries: [
      {
        queryKey: ["oktausers"],
        queryFn: () =>
        fetch("https://laxcoresrv.buck.local:8000/buckokta/category/att/comparison/match?_category=users").then((res) => res.json()),
      }
    ]
  });

  // Toggle user expansion
  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Toggle all expansions
  const toggleAllExpand = () => {
    setIsExpanded(!isExpanded);
    
    if (oktausers.data) {
      const newExpandedState = {};
      oktausers.data.forEach(user => {
        newExpandedState[user.id] = !isExpanded;
      });
      setExpandedUsers(newExpandedState);
    }
  };

  // Loading state
  if (oktausers.isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Okta Users'}
        </Typography>
        
        {/* Search placeholder */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rectangular" width={400} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>
        
        {/* User card skeletons */}
        <Grid container spacing={3}>
          {[...Array(5)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="70%" />
                    </Box>
                    <Skeleton variant="rectangular" width={100} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Error state
  if (oktausers.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Okta Users'}
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#fff5f5' }}>
          <Typography color="error" variant="h6" gutterBottom>An error occurred</Typography>
          <Typography color="text.secondary">
            {oktausers.error.message || JSON.stringify(oktausers.error)}
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Not found state
  if (oktausers.data?.detail === "Not Found") {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Okta Users'}
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">No user data found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            The API returned a "Not Found" response.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Data processing
  if (oktausers.data) {
    // Apply filters (search + active)
    let filteredUsers = oktausers.data;
    
    // Apply active filter if enabled
    if (showOnlyActive) {
      filteredUsers = filteredUsers.filter(user => user.status === 'ACTIVE');
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user => {
        const searchableFields = [
          user.profile?.displayName,
          user.profile?.firstName,
          user.profile?.lastName,
          user.profile?.login,
          user.profile?.email,
          user.profile?.title,
          user.profile?.city,
          user.profile?.description
        ];
        
        return searchableFields.some(field => 
          field && field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
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

    // Format date strings
    const formatDate = (dateString) => {
      if (!dateString) return 'Never';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (e) {
        return dateString.split('T')[0] || 'Invalid date';
      }
    };

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant='h4' color="primary" fontWeight="medium">
            {props.name || 'Okta Users'}
          </Typography>
          
          <Chip 
            label={`${oktausers.data.length} Users`} 
            color="primary" 
            variant="outlined" 
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Search and expand controls */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <TextField
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearAllIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Chip
              label="Active Users Only"
              color={showOnlyActive ? "primary" : "default"}
              onClick={() => setShowOnlyActive(!showOnlyActive)}
              variant={showOnlyActive ? "filled" : "outlined"}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: showOnlyActive ? 'primary.light' : 'action.hover'
                }
              }}
            />
          </Box>
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={toggleAllExpand}
            startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {isExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
        </Box>

        {/* User cards */}
        {filteredUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No users match your search</Typography>
            <Button 
              variant="outlined" 
              onClick={() => setSearchTerm('')}
              startIcon={<ClearAllIcon />}
              sx={{ mt: 2 }}
            >
              Clear Search
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredUsers.map((user) => {
              const isUserExpanded = expandedUsers[user.id] || false;
              const initials = getUserInitials(user);
              const lastLoginDate = formatDate(user.lastLogin);
              const lastUpdatedDate = formatDate(user.lastUpdated);
              const isActive = user.status === 'ACTIVE';
              
              return (
                <Grid item xs={12} key={user.id || uuid()}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      transition: 'all 0.2s ease-in-out',
                      borderLeft: isActive ? '4px solid #4caf50' : '4px solid #9e9e9e',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* User summary */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleUserExpand(user.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: isActive ? 'primary.main' : 'text.disabled',
                              width: 40,
                              height: 40
                            }}
                          >
                            {initials}
                          </Avatar>
                          
                          <Box>
                            <Typography variant="subtitle1">
                              {user.profile?.displayName || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.profile?.email || user.profile?.login || 'No login information'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          {user.profile?.title && (
                            <Chip 
                              icon={<WorkIcon fontSize="small" />}
                              label={user.profile.title} 
                              size="small" 
                              variant="outlined"
                              sx={{ maxWidth: 200 }}
                            />
                          )}
                          
                          {user.profile?.city && (
                            <Chip 
                              icon={<LocationCityIcon fontSize="small" />}
                              label={user.profile.city} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUserExpand(user.id);
                            }}
                          >
                            {isUserExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {/* Expanded details */}
                      <Collapse in={isUserExpanded}>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Basic Information
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                                  <Table size="small">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell width="40%" sx={{ fontWeight: 'medium' }}>First Name</TableCell>
                                        <TableCell>{user.profile?.firstName || 'N/A'}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Last Name</TableCell>
                                        <TableCell>{user.profile?.lastName || 'N/A'}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Email</TableCell>
                                        <TableCell>
                                          <Box sx={{ 
                                            wordBreak: 'break-all', 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: 0.5
                                          }}>
                                            {user.profile?.email || 'N/A'}
                                            {user.profile?.email && (
                                              <Tooltip title={copiedText === user.profile.email ? "Copied!" : "Copy to clipboard"}>
                                                <IconButton 
                                                  size="small" 
                                                  onClick={() => copyToClipboard(user.profile.email)}
                                                  color={copiedText === user.profile.email ? "success" : "default"}
                                                >
                                                  <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            )}
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Login</TableCell>
                                        <TableCell>
                                          <Box sx={{ 
                                            wordBreak: 'break-all',
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: 0.5
                                          }}>
                                            {user.profile?.login || 'N/A'}
                                            {user.profile?.login && (
                                              <Tooltip title={copiedText === user.profile.login ? "Copied!" : "Copy to clipboard"}>
                                                <IconButton 
                                                  size="small" 
                                                  onClick={() => copyToClipboard(user.profile.login)}
                                                  color={copiedText === user.profile.login ? "success" : "default"}
                                                >
                                                  <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            )}
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Employment Details
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                                  <Table size="small">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell width="40%" sx={{ fontWeight: 'medium' }}>Title</TableCell>
                                        <TableCell>{user.profile?.title || 'N/A'}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Department</TableCell>
                                        <TableCell>{user.profile?.department || 'N/A'}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>City</TableCell>
                                        <TableCell>{user.profile?.city || 'N/A'}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Description</TableCell>
                                        <TableCell>{user.profile?.description || 'N/A'}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={4}>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Account Status
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none' }}>
                                  <Table size="small">
                                    <TableBody>
                                      <TableRow>
                                        <TableCell width="40%" sx={{ fontWeight: 'medium' }}>Status</TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={user.status || 'Unknown'} 
                                            color={isActive ? 'success' : 'default'} 
                                            size="small"
                                            variant={isActive ? 'filled' : 'outlined'}
                                          />
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Last Login</TableCell>
                                        <TableCell>{lastLoginDate}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>Last Updated</TableCell>
                                        <TableCell>{lastUpdatedDate}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'medium' }}>ID</TableCell>
                                        <TableCell>
                                          <Box sx={{ 
                                            wordBreak: 'break-all', 
                                            fontSize: '0.8rem', 
                                            fontFamily: 'monospace',
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: 0.5
                                          }}>
                                            {user.id || 'N/A'}
                                            {user.id && (
                                              <Tooltip title={copiedText === user.id ? "Copied!" : "Copy to clipboard"}>
                                                <IconButton 
                                                  size="small" 
                                                  onClick={() => copyToClipboard(user.id)}
                                                  color={copiedText === user.id ? "success" : "default"}
                                                >
                                                  <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                            )}
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredUsers.length} of {oktausers.data.length} users
            {showOnlyActive && ' (Active only)'}
            {searchTerm && ` • Search: "${searchTerm}"`}
          </Typography>
        </Box>
      </Container>
    );
  }

  // Default state (should not reach here)
  return null;
}