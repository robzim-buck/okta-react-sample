import React, { useEffect, useState } from 'react';
import { 
  Typography, Container, Paper, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Chip, Tooltip, TextField, InputAdornment, Switch, FormControlLabel,
  Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOktaAuth } from '@okta/okta-react';

export default function GoogleUsers(props) {
  const { authState } = useOktaAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [googleUsers, setGoogleUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyWithPhotos, setShowOnlyWithPhotos] = useState(false);
  const [showOnlyFreelancers, setShowOnlyFreelancers] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  console.log("GoogleUsers render - Auth state:", authState?.isAuthenticated);

  useEffect(() => {
    console.log("GoogleUsers component mounted");
    // Simple timeout to check if component is rendering at all
    const timer = setTimeout(() => {
      setLoading(false);
      console.log("Loading state turned off");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  
  // Get user initials for avatar fallback
  const getUserInitials = (user) => {
    const firstName = user.name?.givenName || '';
    const lastName = user.name?.familyName || '';
    
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

  // Manually fetch data
  useEffect(() => {
    const fetchGoogleUsers = async () => {
      try {
        console.log("Fetching Google staff users...");
        const staffRes = await fetch("https://laxcoresrv.buck.local:8000/buckgoogleusers?status=active&emp_type=Staff");
        if (!staffRes.ok) {
          throw new Error(`HTTP error! Status: ${staffRes.status}`);
        }
        const staffData = await staffRes.json();
        console.log("Google staff users fetched successfully:", staffData.length);
        
        console.log("Fetching Google freelance users...");
        const freelanceRes = await fetch("https://laxcoresrv.buck.local:8000/buckgoogleusers?status=active&emp_type=Freelance");
        if (!freelanceRes.ok) {
          throw new Error(`HTTP error! Status: ${freelanceRes.status}`);
        }
        const freelanceData = await freelanceRes.json();
        console.log("Google freelance users fetched successfully:", freelanceData.length);
        
        // Log sample user data to inspect structure
        if (staffData.length > 0) {
          console.log("Sample Staff Google user:", staffData[0]);
        }
        if (freelanceData.length > 0) {
          console.log("Sample Freelance Google user:", freelanceData[0]);
        }
        
        // Combine both sets of users
        const data = [...staffData, ...freelanceData];
        console.log("Combined Google users:", data.length);
        
        // Process Google user data to normalize thumbnail URLs
        const processedData = data.map(user => {
          // Check for thumbnail in various possible property names
          const thumbnailUrl = user?.thumbnailPhotoUrl || user?.thumbnail || user?.photo || user?.photoUrl;
          
          if (thumbnailUrl && !user.thumbnailPhotoUrl) {
            // Add standardized property name if found in an alternative property
            return { ...user, thumbnailPhotoUrl: thumbnailUrl };
          }
          
          return user;
        });
        
        // Count users with thumbnails
        const usersWithThumbnails = processedData.filter(user => user.thumbnailPhotoUrl).length;
        console.log(`Google users with thumbnails: ${usersWithThumbnails}`);
        
        setGoogleUsers(processedData);
      } catch (error) {
        console.error("Error fetching Google users:", error);
        setError("Failed to fetch Google users");
      }
    };

    fetchGoogleUsers();
  }, []);

  // Extract unique departments from users for the filter dropdown
  const departments = [...new Set(
    googleUsers
      .filter(user => user.organizations && user.organizations[0]?.department)
      .map(user => user.organizations[0].department)
  )].sort();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Google Users'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Google Users'}
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#fff5f5' }}>
          <Typography color="error" variant="h6" gutterBottom>An error occurred</Typography>
          <Typography color="text.secondary">
            {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
        {props.name || 'Google Users'}
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
      
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Summary</Typography>
        <Typography>
          {googleUsers.length > 0 
            ? `Successfully loaded ${googleUsers.length} Google users.` 
            : "No users found."}
        </Typography>
        
        {googleUsers.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            {/* Department chips - show top 5 departments by user count */}
            {departments.slice(0, 5).map(dept => {
              const count = googleUsers.filter(user => 
                user.organizations && 
                user.organizations[0]?.department === dept
              ).length;
              if (count > 0) {
                return (
                  <Chip 
                    key={dept}
                    label={`${count} ${dept}`}
                    color="primary"
                    variant={departmentFilter === dept ? 'filled' : 'outlined'}
                    size="small"
                    onClick={() => setDepartmentFilter(departmentFilter === dept ? '' : dept)}
                    sx={{ cursor: 'pointer' }}
                  />
                );
              }
              return null;
            })}
            
            {/* Photo chip */}
            <Chip 
              label={`${googleUsers.filter(u => u.thumbnailPhotoUrl).length} Users with Photos`}
              color="secondary" 
              size="small"
              variant={showOnlyWithPhotos ? 'filled' : 'outlined'}
              onClick={() => setShowOnlyWithPhotos(!showOnlyWithPhotos)}
              sx={{ cursor: 'pointer' }}
            />
            
            {/* Freelancer chip */}
            <Chip 
              label={`${googleUsers.filter(u => 
                u.organizations && 
                u.organizations[0]?.costCenter && 
                u.organizations[0].costCenter.toLowerCase() === 'freelance'
              ).length} Freelancers`}
              color="error" 
              size="small"
              variant={showOnlyFreelancers ? 'filled' : 'outlined'}
              onClick={() => setShowOnlyFreelancers(!showOnlyFreelancers)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        )}
      </Paper>
      
      {googleUsers.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search users..."
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="department-filter-label">Department</InputLabel>
              <Select
                labelId="department-filter-label"
                id="department-filter"
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={showOnlyWithPhotos}
                  onChange={(e) => setShowOnlyWithPhotos(e.target.checked)}
                  color="secondary"
                />
              }
              label="Show only users with photos"
            />
            
            <FormControlLabel
              control={
                <Switch 
                  checked={showOnlyFreelancers}
                  onChange={(e) => setShowOnlyFreelancers(e.target.checked)}
                  color="error"
                />
              }
              label="Show only freelancers"
            />
          </Box>
        </Paper>
      )}
      
      {googleUsers.length > 0 && (() => {
        // Apply filters
        let filteredUsers = [...googleUsers];
        
        // Apply search filter
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(user => {
            const searchableFields = [
              user.name?.fullName,
              user.name?.givenName,
              user.name?.familyName,
              user.primaryEmail,
              user.organizations?.[0]?.title,
              user.organizations?.[0]?.department
            ];
            
            return searchableFields.some(field => 
              field && field.toLowerCase().includes(searchTerm.toLowerCase())
            );
          });
        }
        
        // Apply department filter
        if (departmentFilter) {
          filteredUsers = filteredUsers.filter(user => 
            user.organizations?.[0]?.department === departmentFilter
          );
        }
        
        // Apply photo filter
        if (showOnlyWithPhotos) {
          filteredUsers = filteredUsers.filter(user => 
            user.thumbnailPhotoUrl
          );
        }
        
        // Apply freelancer filter
        if (showOnlyFreelancers) {
          filteredUsers = filteredUsers.filter(user => 
            user.organizations && 
            user.organizations[0]?.costCenter && 
            user.organizations[0].costCenter.toLowerCase() === 'freelance'
          );
        }
        
        return (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const isFreelancer = user.organizations && 
                                    user.organizations[0]?.costCenter && 
                                    user.organizations[0].costCenter.toLowerCase() === 'freelance';
                
                return (
                  <TableRow key={user.id || user.primaryEmail}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user.thumbnailPhotoUrl ? (
                          <Tooltip title={
                            isFreelancer
                              ? 'Freelancer - Google profile photo' 
                              : 'Google profile photo'
                          }>
                            <Avatar 
                              src={user.thumbnailPhotoUrl}
                              sx={{ 
                                width: 32, 
                                height: 32,
                                border: isFreelancer
                                  ? '2px solid #f50057' 
                                  : '2px solid #8c9eff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Avatar 
                            sx={{ 
                              bgcolor: isFreelancer ? '#f50057' : 'primary.main',
                              width: 32, 
                              height: 32 
                            }}
                          >
                            {getUserInitials(user)}
                          </Avatar>
                        )}
                        <Box>
                          {user.name?.fullName || 
                            `${user.name?.givenName || ''} ${user.name?.familyName || ''}`}
                          {isFreelancer && (
                            <Chip 
                              label="Freelance" 
                              size="small" 
                              color="error" 
                              variant="outlined"
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.primaryEmail || 'N/A'}</TableCell>
                    <TableCell>{user.organizations?.[0]?.title || 'N/A'}</TableCell>
                    <TableCell>
                      {user.organizations?.[0]?.department ? (
                        <Chip 
                          label={user.organizations[0].department} 
                          color="primary" 
                          size="small"
                          variant="outlined"
                        />
                      ) : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredUsers.length === googleUsers.length ? (
                `Showing all ${googleUsers.length} users`
              ) : (
                <>
                  Showing {filteredUsers.length} of {googleUsers.length} users
                  {departmentFilter && ` (filtered by department: ${departmentFilter})`}
                  {searchTerm && ` (search: "${searchTerm}")`}
                  {showOnlyWithPhotos && ` (with photos only)`}
                  {showOnlyFreelancers && ` (freelancers only)`}
                </>
              )}
            </Typography>
          </Box>
        </TableContainer>
        );
      })()}
    </Container>
  );
}