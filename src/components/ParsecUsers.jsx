import {
  Chip, Typography, Paper, Grid, Box, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Avatar, Tooltip
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useQueries } from "@tanstack/react-query";
import { useApiGet } from '../hooks/useApi';
import uuid from 'react-uuid';
import { useState, useMemo } from 'react';

export default function ParsecUsers({ name = "Parsec" }) {
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [userMachines, setUserMachines] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get user initials for avatar fallback
  const getUserInitials = (user) => {
    if (!user.name) return 'PU'; // Parsec User

    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0]) {
      return nameParts[0][0].toUpperCase();
    }

    return 'PU'; // Parsec User
  };

  // Fetch Parsec users
  const [parsecUsers] = useQueries({
    queries: [
      {
        queryKey: ["parsecUsers"],
        queryFn: () => fetch("https://laxcoresrv.buck.local:8000/parsecinfo/category?_category=members")
          .then((res) => res.json()),
      }
    ]
  });

  // Fetch Google staff users
  const googleStaffUsersQuery = useApiGet('/buckgoogleusers', {
    queryParams: { status: 'active', emp_type: 'Staff' },
    queryConfig: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    }
  });

  // Fetch Google freelance users
  const googleFreelanceUsersQuery = useApiGet('/buckgoogleusers', {
    queryParams: { status: 'active', emp_type: 'Freelance' },
    queryConfig: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: 1000
    },
    dependencies: ['freelance'] // Add to query key to differentiate from staff query
  });

  // Combine Google users data
  const googleUsers = useMemo(() => {
    if (googleStaffUsersQuery.isLoading || googleFreelanceUsersQuery.isLoading) {
      return [];
    }

    if (googleStaffUsersQuery.error || googleFreelanceUsersQuery.error) {
      console.error("Error fetching Google users");
      return [];
    }

    const staffData = googleStaffUsersQuery.data || [];
    const freelanceData = googleFreelanceUsersQuery.data || [];

    // Combine both sets of users
    const data = [...staffData, ...freelanceData];
    console.log("Combined Google users:", data.length);

    return data;
  }, [googleStaffUsersQuery.data, googleFreelanceUsersQuery.data,
      googleStaffUsersQuery.isLoading, googleFreelanceUsersQuery.isLoading,
      googleStaffUsersQuery.error, googleFreelanceUsersQuery.error]);

  // Create Google user lookup by email
  const googleUsersByEmail = useMemo(() => {
    if (!googleUsers.length) return {};

    const emailMap = {};

    googleUsers.forEach(user => {
      if (user?.primaryEmail) {
        emailMap[user.primaryEmail.toLowerCase()] = user;

        // Also store by username part only (before the @) for flexible matching
        const username = user.primaryEmail.split('@')[0].toLowerCase();
        if (username) {
          emailMap[username] = user;
        }
      }
    });

    console.log(`Created Google user map with ${Object.keys(emailMap).length} entries`);
    return emailMap;
  }, [googleUsers]);

  // Helper function to get Google user for a Parsec user
  const getGoogleUserForParsecUser = (parsecUser) => {
    if (!parsecUser?.email) return null;

    const email = parsecUser.email.toLowerCase();

    // Try exact email match first
    if (googleUsersByEmail[email]) {
      return googleUsersByEmail[email];
    }

    // Try username part only
    const username = email.split('@')[0].toLowerCase();
    if (username && googleUsersByEmail[username]) {
      return googleUsersByEmail[username];
    }

    return null;
  };

  const fetchUserMachines = async (email) => {
    setLoading(true);
    setSelectedUserEmail(email);
    try {
      const response = await fetch(`https://laxcoresrv.buck.local:8000/parsec_machines_for_user/${email}`);
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      setUserMachines(data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user machines:", error);
      alert(`Error fetching machines for ${email}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (parsecUsers.isLoading) return <CircularProgress />;
  if (parsecUsers.error) return `An error has occurred: ${parsecUsers.error.message}`;
  
  if (parsecUsers.data) {
    const sortedData = parsecUsers.data.sort((a, b) => a.email.localeCompare(b.email));
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h3" sx={{ mb: 3 }}>{name} Users</Typography>
        <Grid container spacing={2} columns={4}>
          {sortedData.map((item) => (
            <Grid item xs={1} key={uuid()}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  {(() => {
                    const googleUser = getGoogleUserForParsecUser(item);
                    const isFreelance = googleUser?.organizations &&
                                        googleUser.organizations[0]?.costCenter &&
                                        googleUser.organizations[0].costCenter.toLowerCase() === 'freelance';

                    if (googleUser?.thumbnailPhotoUrl) {
                      return (
                        <Tooltip title={isFreelance ? "Freelancer - Google profile photo" : "Google profile photo"}>
                          <Avatar
                            src={googleUser.thumbnailPhotoUrl}
                            alt={getUserInitials(item)}
                            imgProps={{
                              loading: "lazy",
                              referrerPolicy: "no-referrer",
                              onError: (e) => {
                                console.log("Image failed to load for:", item.email);
                                e.target.style.display = 'none';
                              }
                            }}
                            sx={{
                              width: 48,
                              height: 48,
                              border: isFreelance
                                ? '2px solid #f50057'  // Freelancer border
                                : '2px solid #8c9eff', // Staff border
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          >
                            {getUserInitials(item)}
                          </Avatar>
                        </Tooltip>
                      );
                    } else {
                      return (
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: 'primary.main',
                            border: '2px solid #8c9eff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {getUserInitials(item)}
                        </Avatar>
                      );
                    }
                  })()}

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      {item.name}
                      {(() => {
                        const googleUser = getGoogleUserForParsecUser(item);
                        const isFreelance = googleUser?.organizations &&
                                          googleUser.organizations[0]?.costCenter &&
                                          googleUser.organizations[0].costCenter.toLowerCase() === 'freelance';

                        if (isFreelance) {
                          return (
                            <Chip
                              label="Freelance"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                            />
                          );
                        }
                        return null;
                      })()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {item.email} • UserID {item.user_id}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        variant="outlined"
                        color="success"
                        label={`Rule ${item.team_app_rule.name}`}
                        sx={{ mr: 1, mb: 1 }}
                        size="small"
                      />
                      <Chip
                        variant="outlined"
                        color="success"
                        label={`Group ID ${item.group_id}`}
                        sx={{ mb: 1 }}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Created: {item.created_at ? item.created_at.split('T')[0] : 'N/A'} •&nbsp;
                  Updated: {item.updated_at ? item.updated_at.split('T')[0] : 'N/A'} •&nbsp;
                  Last Connected: {item.last_connected_at ? item.last_connected_at.split('T')[0] : 'N/A'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => fetchUserMachines(item.email)}
                  disabled={loading && selectedUserEmail === item.email}
                >
                  {loading && selectedUserEmail === item.email ? 'Loading...' : 'View Machines'}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Machines for {selectedUserEmail}
          </DialogTitle>
          <DialogContent dividers>
            {userMachines.length > 0 ? (
              <Box>
                {userMachines.map((machine, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">{machine.name || 'Unnamed User'}</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Host: {machine.host || 'N/A'} 
                        </Typography>
                        <Typography variant="body2">
                          Email: {machine.email || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Guests Allowed: {machine.guests ? 'Yes' : 'No'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          Status: <Chip size="small" color={machine.machine_online?.toLowerCase() === 'online' ? 'success' : 'error'} 
                                         label={machine.machine_online || 'Unknown'} />
                        </Typography>
                        <Typography variant="body2">
                          Created: {machine.created ? new Date(machine.created).toLocaleDateString() : 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Last Connected: {machine.last_connected ? new Date(machine.last_connected).toLocaleString() : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body1">No machines found for this user</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  return null;
}