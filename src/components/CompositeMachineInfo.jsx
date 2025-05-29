import { useState } from 'react';
import { 
  Typography, Box, CircularProgress, Paper, Divider, Grid, Chip,
  Container, Card, CardContent, TextField, InputAdornment, 
  IconButton, Stack, Tabs, Tab, TableContainer, Table, TableHead,
  TableBody, TableRow, TableCell, Collapse, Alert, AlertTitle,
  Button, Avatar
} from '@mui/material';
import { useQuery } from "@tanstack/react-query";
import { useApiGet, useProtectedApiGet } from '../hooks/useApi';
import {
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  Computer as ComputerIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';

const CompositeMachineInfo = () => {
  // State for search, filtering, and expanded items
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMachines, setExpandedMachines] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    os: '',
    make: '',
    model: ''
  });

  // Toggle machine expansion
  const toggleMachineExpand = (machineId) => {
    setExpandedMachines(prev => ({
      ...prev,
      [machineId]: !prev[machineId]
    }));
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle clearing the search filter
  const handleClearFilter = () => {
    setSearchTerm('');
  };
  
  // Handle resetting all filters
  const handleResetFilters = () => {
    setFilters({
      os: '',
      make: '',
      model: ''
    });
  };
  
  // Format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
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

  // API Queries
  const parsecInfo = useQuery({
    queryKey: ['parsecinfo'],
    queryFn: async () => {
      try {
        const res = await fetch("https://laxcoresrv.buck.local:8000/parsecreport", {
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching Parsec info:", error);
        throw error;
      }
    },
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000
  });

  const jamfComputersFromMongo = useQuery({
    queryKey: ['jamfcomputers'],
    queryFn: async () => {
      try {
        const res = await fetch("https://laxcoresrv.buck.local:8000/mongo/jamf_computers_from_mongo?count=999", {
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching JAMF computers:", error);
        throw error;
      }
    },
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000
  });

  const machineInfoFromLDAP = useQuery({
    queryKey: ['ldapmachineinfo'],
    queryFn: async () => {
      try {
        const res = await fetch('https://laxcoresrv.buck.local:8000/buckldap_machineinfo', {
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching LDAP machine info:", error);
        throw error;
      }
    },
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000
  });





  // Loading state
  if (parsecInfo.isLoading || jamfComputersFromMongo.isLoading || machineInfoFromLDAP.isLoading ) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
          Composite Machine Information
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="body1" sx={{ mt: 3 }}>
              Loading machine data from multiple sources...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This may take a moment as we gather information from JAMF, Active Directory, Parsec.
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Error state
  if (parsecInfo.error || jamfComputersFromMongo.error || machineInfoFromLDAP.error ) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
          Composite Machine Information
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error Loading Data</AlertTitle>
          One or more data sources failed to load. Please try refreshing the page.
        </Alert>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>Error Details:</Typography>
          
          {parsecInfo.error && (
            <Alert severity="error" sx={{ mb: 2 }} variant="outlined">
              <AlertTitle>Parsec Data Error</AlertTitle>
              {parsecInfo.error.message || JSON.stringify(parsecInfo.error)}
            </Alert>
          )}
          
          {jamfComputersFromMongo.error && (
            <Alert severity="error" sx={{ mb: 2 }} variant="outlined">
              <AlertTitle>JAMF Data Error</AlertTitle>
              {jamfComputersFromMongo.error.message || JSON.stringify(jamfComputersFromMongo.error)}
            </Alert>
          )}
          
          {machineInfoFromLDAP.error && (
            <Alert severity="error" sx={{ mb: 2 }} variant="outlined">
              <AlertTitle>LDAP Data Error</AlertTitle>
              {machineInfoFromLDAP.error.message || JSON.stringify(machineInfoFromLDAP.error)}
            </Alert>
          )}
          
        </Paper>
      </Container>
    );
  }


  // Data processing
  // Sort machines alphabetically
  const sortedMachineInfo = machineInfoFromLDAP.data.sort((a, b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  
  // Process data for filtering and display
  const processedMachines = sortedMachineInfo.map(machine => {
    // Find related data from other sources
    const jamfComputerInfo = jamfComputersFromMongo.data.find(
      item => item.general.name.toLowerCase() === machine.name.toLowerCase()
    );
    
    const parsecHostInfo = parsecInfo.data.find(
      item => item.host.toLowerCase() === machine.name.toLowerCase()
    );
    
    
    // Extract useful properties
    const hwMake = jamfComputerInfo?.hardware?.make || 'N/A';
    const hwModel = jamfComputerInfo?.hardware?.model || 'N/A';
    const osName = jamfComputerInfo?.operatingSystem?.name || 'N/A';
    const osVersion = jamfComputerInfo?.operatingSystem?.version || 'N/A';
    const osBuild = jamfComputerInfo?.operatingSystem?.build || 'N/A';
    const lastLogonTimestamp = formatDate(machine.lastLogonTimestamp);
    
    // Return combined data object
    return {
      id: machine.name, // Using machine name as unique ID
      name: machine.name,
      activeDirectory: {
        lastLogon: lastLogonTimestamp,
        operatingSystem: machine.operatingSystem || 'N/A'
      },
      jamf: {
        make: hwMake,
        model: hwModel,
        osName: osName,
        osVersion: osVersion,
        osBuild: osBuild
      },
      parsec: {
        username: parsecHostInfo?.name || 'N/A',
        online: parsecHostInfo?.machine_online ? 'Yes' : 'No',
        lastConnected: parsecHostInfo?.last_connected ? formatDate(parsecHostInfo.last_connected) : 'N/A',
        guests: parsecHostInfo?.guests ? 'Yes' : 'No'
      }
    };
  });
  
  // Apply search filter
  const filteredMachines = processedMachines.filter(machine => {
    if (!searchTerm) return true;
    
    return (
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.activeDirectory.operatingSystem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.jamf.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.jamf.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.parsec.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Apply additional filters
  const finalFilteredMachines = filteredMachines.filter(machine => {
    const passedOsFilter = !filters.os || machine.activeDirectory.operatingSystem.toLowerCase().includes(filters.os.toLowerCase());
    const passedMakeFilter = !filters.make || machine.jamf.make.toLowerCase().includes(filters.make.toLowerCase());
    const passedModelFilter = !filters.model || machine.jamf.model.toLowerCase().includes(filters.model.toLowerCase());
    
    return passedOsFilter && passedMakeFilter && passedModelFilter;
  });
  
  // Extract unique values for filters
  const uniqueOsValues = [...new Set(processedMachines.map(m => m.activeDirectory.operatingSystem).filter(Boolean))];
  const uniqueMakeValues = [...new Set(processedMachines.map(m => m.jamf.make).filter(Boolean))];
  const uniqueModelValues = [...new Set(processedMachines.map(m => m.jamf.model).filter(Boolean))];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
          Composite Machine Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consolidated view of machine data from Active Directory, JAMF and Parsec
        </Typography>
      </Box>
      
      {/* Tabs & Search */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 2 }}
        >
          <Tab label="All Sources" />
          <Tab label="Active Directory" />
          <Tab label="JAMF" />
          <Tab label="Parsec" />
        </Tabs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearFilter}>
                    <ClearAllIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <IconButton 
            size="small" 
            color={showFilters ? "primary" : "default"}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ border: showFilters ? '1px solid' : 'none' }}
          >
            <FilterIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Filters */}
      <Collapse in={showFilters}>
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Operating System"
                size="small"
                fullWidth
                select
                SelectProps={{ native: true }}
                value={filters.os}
                onChange={(e) => setFilters({ ...filters, os: e.target.value })}
              >
                <option value="">Any OS</option>
                {uniqueOsValues.map(os => (
                  <option key={os} value={os}>{os}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Make"
                size="small"
                fullWidth
                select
                SelectProps={{ native: true }}
                value={filters.make}
                onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              >
                <option value="">Any Make</option>
                {uniqueMakeValues.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Model"
                size="small"
                fullWidth
                select
                SelectProps={{ native: true }}
                value={filters.model}
                onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              >
                <option value="">Any Model</option>
                {uniqueModelValues.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<ClearAllIcon />}
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      
      {/* Results summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {finalFilteredMachines.length} of {processedMachines.length} machines
        </Typography>
        
        {searchTerm && (
          <Typography variant="body2" color="text.secondary">
            Search: "{searchTerm}"
          </Typography>
        )}
      </Box>
      
      {/* Machine list */}
      {finalFilteredMachines.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No machines match your search or filters
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchTerm('');
              handleResetFilters();
            }}
            startIcon={<ClearAllIcon />}
            sx={{ mt: 2 }}
          >
            Clear All Filters
          </Button>
        </Paper>
      ) : (
        <Box>
          {finalFilteredMachines.map(machine => {
            const isExpanded = expandedMachines[machine.id] || false;
            
            return (
              <Card 
                key={machine.id} 
                variant="outlined" 
                sx={{ mb: 2 }}
              >
                {/* Machine header - always visible */}
                <CardContent 
                  sx={{ 
                    p: 2, 
                    '&:last-child': { pb: 2 },
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleMachineExpand(machine.id)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <ComputerIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {machine.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Chip 
                            size="small" 
                            label={machine.jamf.make} 
                            variant="outlined" 
                          />
                          <Chip 
                            size="small" 
                            label={machine.activeDirectory.operatingSystem} 
                            variant="outlined" 
                          />
                          {machine.parsec.username !== 'N/A' && (
                            <Chip 
                              size="small" 
                              label={`Parsec: ${machine.parsec.username}`} 
                              variant="outlined"
                              color={machine.parsec.online === 'Yes' ? 'success' : 'default'}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    <IconButton size="small">
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </CardContent>
                
                {/* Expanded details section */}
                <Collapse in={isExpanded}>
                  <Divider />
                  <CardContent sx={{ p: 2, pt: 0 }}>
                    <Grid container spacing={2}>
                      {/* Active Directory Section */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Active Directory Information
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium', width: '40%' }}>
                                    Last Logon
                                  </TableCell>
                                  <TableCell>{machine.activeDirectory.lastLogon}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    Operating System
                                  </TableCell>
                                  <TableCell>{machine.activeDirectory.operatingSystem}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                      
                      {/* JAMF Section */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            JAMF Information
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium', width: '40%' }}>
                                    Make
                                  </TableCell>
                                  <TableCell>{machine.jamf.make}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    Model
                                  </TableCell>
                                  <TableCell>{machine.jamf.model}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    OS Name
                                  </TableCell>
                                  <TableCell>{machine.jamf.osName}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    OS Version
                                  </TableCell>
                                  <TableCell>{machine.jamf.osVersion}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    OS Build
                                  </TableCell>
                                  <TableCell>{machine.jamf.osBuild}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                      
                      
                      {/* Parsec Section */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Parsec Information
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableBody>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium', width: '40%' }}>
                                    Username
                                  </TableCell>
                                  <TableCell>{machine.parsec.username}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    Online Status
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      size="small" 
                                      label={machine.parsec.online} 
                                      color={machine.parsec.online === 'Yes' ? 'success' : 'default'}
                                    />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    Last Connected
                                  </TableCell>
                                  <TableCell>{machine.parsec.lastConnected}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 'medium' }}>
                                    Has Guests
                                  </TableCell>
                                  <TableCell>{machine.parsec.guests}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
  }
  // }

export default CompositeMachineInfo;
