import { Chip, Typography, Paper, Grid, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useQueries } from "@tanstack/react-query";
import uuid from 'react-uuid';
import { useState } from 'react';

export default function ParsecUsers({ name = "Parsec" }) {
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [userMachines, setUserMachines] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [parsecUsers] = useQueries({
    queries: [
      {
        queryKey: ["parsecUsers"],
        queryFn: () => fetch("https://laxcoresrv.buck.local:8000/parsecinfo/category?_category=members")
          .then((res) => res.json()),
      }
    ]
  });

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
                <Typography variant="h6">
                  {item.name}
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      variant="outlined"
                      color="success"
                      label={`Rule ${item.team_app_rule.name}`}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      variant="outlined"
                      color="success"
                      label={`Group ID ${item.group_id}`}
                      sx={{ mb: 1 }}
                    />
                  </Box>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {item.email} • UserID {item.user_id}
                </Typography>
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