import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import { 
  Typography, Box, Container, Grid, 
  Card, CardContent, Chip, Divider,
  Accordion, AccordionSummary, AccordionDetails,
  Button, LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import uuid from 'react-uuid';

export default function JAMFMachineInfo(props) {
  const [expanded, setExpanded] = useState({});
  
  // Toggle expansion state for a specific machine
  const handleToggle = (machineId) => {
    setExpanded(prev => ({
      ...prev,
      [machineId]: !prev[machineId]
    }));
  };

  const [jamf_machine_info] = useQueries({
    queries: [
      {
        queryKey: ["jamf_machine_info"],
        queryFn: () =>
        fetch("https://laxcoresrv.buck.local:8000/jamf/computers_from_mongo",
          {
            methood: "GET",
            headers: {"x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^+&%^$#$#^$#^#nrghaoiughnoaergfo",
                    "Content-type": "application/json"
            }
          },
        ).then((res) => res.json()),
      },
    ]
  });

  if (jamf_machine_info.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }
  
  if (jamf_machine_info.error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>An error has occurred</Typography>
        <Typography color="text.secondary">{jamf_machine_info.error.message}</Typography>
      </Box>
    );
  }
  
  if (jamf_machine_info.data) {
    const sortedData = [...jamf_machine_info.data].sort((a, b) => 
      a.general.name.localeCompare(b.general.name)
    );
    
    if (!sortedData || sortedData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary">No JAMF machine data found</Typography>
        </Box>
      );
    }

    // Helper function to determine machine status color
    const getMachineStatusColor = (machine) => {
      // Add logic to determine status based on machine state
      // For example, check disk space or other criteria
      const availableDiskSpace = machine.storage.bootDriveAvailableSpaceMegabytes;
      
      if (availableDiskSpace < 5000) return '#f44336'; // red - critical
      if (availableDiskSpace < 10000) return '#ff9800'; // amber - warning
      return '#4caf50'; // green - healthy
    };

    // Helper function to format bytes
    const formatBytes = (megabytes) => {
      if (megabytes < 1000) return `${megabytes} MB`;
      return `${(megabytes / 1000).toFixed(2)} GB`;
    };

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h4' color="primary" fontWeight="medium">
            {props.name || 'JAMF Machine Information'}
          </Typography>
          <Chip 
            label={`${sortedData.length} Machines`} 
            color="primary" 
            variant="outlined" 
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Grid container spacing={3}>
          {sortedData.map((machine) => {
            const machineId = machine._id || uuid();
            const statusColor = getMachineStatusColor(machine);
            const diskSpacePercentage = (machine.storage.bootDriveAvailableSpaceMegabytes / machine.storage.bootDriveSizeMegabytes * 100) || 0;
            
            // Determine OS version color for visual cue
            const getOSVersionColor = () => {
              const version = machine.operatingSystem.version || '';
              // Example logic - you can customize based on your requirements
              if (version.startsWith('10.15')) return 'info'; // Catalina
              if (version.startsWith('11.')) return 'success'; // Big Sur
              if (version.startsWith('12.')) return 'secondary'; // Monterey
              if (version.startsWith('13.')) return 'primary'; // Ventura
              return 'default';
            };
            
            return (
              <Grid item xs={12} key={machineId}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    transition: 'all 0.2s ease-in-out',
                    borderLeft: `4px solid ${statusColor}`,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Accordion 
                      expanded={expanded[machineId] || false}
                      onChange={() => handleToggle(machineId)}
                      sx={{ boxShadow: 'none' }}
                    >
                      <AccordionSummary 
                        expandIcon={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button 
                              size="small" 
                              variant="text" 
                              endIcon={<ExpandMoreIcon />}
                              sx={{ 
                                ml: 1,
                                minWidth: 100,
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {expanded[machineId] ? 'Hide Details' : 'Show Details'}
                            </Button>
                          </Box>
                        }
                        sx={{ px: 3, py: 2 }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant='h6'>
                              {machine.general.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {machine.hardware.make} {machine.hardware.model}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                              <Chip 
                                variant="outlined" 
                                color={getOSVersionColor()} 
                                size="small"
                                label={`macOS ${machine.operatingSystem.name}`} 
                              />
                              <Chip 
                                variant="outlined" 
                                color="info" 
                                size="small"
                                label={`IP: ${machine.general.lastIpAddress || 'N/A'}`} 
                              />
                              {machine.userAndLocation.username && (
                                <Chip 
                                  variant="outlined" 
                                  color="secondary" 
                                  size="small"
                                  label={`User: ${machine.userAndLocation.username}`} 
                                />
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                Disk Space: {formatBytes(machine.storage.bootDriveAvailableSpaceMegabytes)} available
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={diskSpacePercentage} 
                                color={diskSpacePercentage < 10 ? "error" : diskSpacePercentage < 25 ? "warning" : "success"}
                                sx={{ height: 8, borderRadius: 5 }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionSummary>
                      
                      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Grid container spacing={3}>
                          {/* Hardware Section */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom color="primary">
                              Hardware Information
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Processor
                                </Typography>
                                <Typography variant="body2">
                                  {machine.hardware.processorType || 'N/A'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  <Chip size="small" label={`${machine.hardware.processorCount || 1} CPU`} />
                                  <Chip size="small" label={`${machine.hardware.coreCount || 'N/A'} Cores`} />
                                  <Chip size="small" label={`${machine.hardware.processorSpeedMhz || 'N/A'} MHz`} />
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Serial Number
                                </Typography>
                                <Typography variant="body2">
                                  {machine.hardware.serialNumber || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Network
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="body2">
                                    Type: {machine.hardware.networkAdapterType || 'N/A'}
                                  </Typography>
                                  <Typography variant="body2">
                                    MAC: {machine.hardware.macAddress || 'N/A'}
                                  </Typography>
                                  {machine.hardware.altMacAddress && (
                                    <Typography variant="body2">
                                      Alt MAC: {machine.hardware.altMacAddress}
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Storage
                                </Typography>
                                <Typography variant="body2">
                                  Total: {formatBytes(machine.storage.bootDriveSizeMegabytes || 0)}
                                </Typography>
                                <Typography variant="body2">
                                  Available: {formatBytes(machine.storage.bootDriveAvailableSpaceMegabytes || 0)}
                                </Typography>
                                <Typography variant="body2">
                                  Used: {formatBytes((machine.storage.bootDriveSizeMegabytes || 0) - (machine.storage.bootDriveAvailableSpaceMegabytes || 0))}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          
                          {/* Software & Location Section */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom color="primary">
                              Software & Location
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Operating System
                                </Typography>
                                <Typography variant="body2">
                                  {machine.operatingSystem.name || 'N/A'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  <Chip size="small" label={`Version: ${machine.operatingSystem.version || 'N/A'}`} />
                                  <Chip size="small" label={`Build: ${machine.operatingSystem.build || 'N/A'}`} />
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Active Directory
                                </Typography>
                                <Typography variant="body2">
                                  Status: {machine.operatingSystem.activeDirectoryStatus || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  User Information
                                </Typography>
                                <Typography variant="body2">
                                  Username: {machine.userAndLocation.username || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  Location: {machine.userAndLocation.location || 'N/A'}
                                </Typography>
                              </Grid>
                              
                              {machine.userAndLocation.extensionAttributes && 
                               machine.userAndLocation.extensionAttributes.length > 0 && (
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Extension Attributes
                                  </Typography>
                                  {machine.userAndLocation.extensionAttributes.map((attr, index) => (
                                    <Typography key={index} variant="body2">
                                      {attr.name || `Attribute ${index+1}`}: {Array.isArray(attr.values) ? attr.values.join(', ') : JSON.stringify(attr.values)}
                                    </Typography>
                                  ))}
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    );
  }
  
  // Fallback
  return null;
}