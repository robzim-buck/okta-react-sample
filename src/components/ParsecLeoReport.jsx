import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import { 
  Typography, Box, Container, Grid, 
  Card, CardContent, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, InputAdornment, Tooltip, Badge,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import CircularProgress from '@mui/material/CircularProgress';
import uuid from 'react-uuid';

export default function ParsecLeoReport(props) {
  // State for search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'host',
    direction: 'ascending'
  });

  // Fetch Parsec data
  const [parsecinfo] = useQueries({
    queries: [
      {
        queryKey: ["parsecinfo"],
        queryFn: () =>
        fetch("https://laxcoresrv.buck.local:8000/parsec_leo_report").then((res) => res.json()),
      },
    ]
  });

  // CSV Export Function
  const exportToCSV = (data) => {
    const columns = ['host', 'name', 'email', 'machine_online', 'created', 'updated', 'last_connected', 'leo_user', 'leo_client_assignment', 'leo_user_assignment'];
    const headers = columns.join(',');
    
    const csvData = data.map(row => {
      return columns.map(column => {
        const value = row[column] || '';
        // Handle values that contain commas by enclosing in quotes
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');
    
    const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'parsec_assignments.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (parsecinfo.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }
  
  // Error state
  if (parsecinfo.error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>An error has occurred</Typography>
        <Typography color="text.secondary">{parsecinfo.error.message}</Typography>
      </Box>
    );
  }
  
  // Data processing
  if (!parsecinfo.data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="warning.main" gutterBottom>No data available</Typography>
        <Typography color="text.secondary" paragraph>
          The Parsec Leo Report endpoint returned an empty response.
        </Typography>
      </Box>
    );
  }
  
  // Continue with data processing if we have data
  if (parsecinfo.data) {
    // Get today's date for comparison
    let yourDate = new Date();
    let today = yourDate.toISOString().split('T')[0];
    
    // Calculate stats
    let onlineUsers = parsecinfo.data.filter(x => x.machine_online === 'Online').length;
    let connectedTodayUsers = parsecinfo.data.filter(x => x.last_connected === today).length;
    let noLeoUsers = parsecinfo.data.filter(x => x.leo_user === 'No Leo User').length;
    
    // Apply search filter
    const filteredData = searchTerm 
      ? parsecinfo.data.filter(item => 
          Object.values(item).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      : parsecinfo.data;
    
    // Sort function
    const sortedData = [...filteredData].sort((a, b) => {
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;
      
      const aValue = a[sortConfig.key].toString().toLowerCase();
      const bValue = b[sortConfig.key].toString().toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    // Handle sort request
    const requestSort = (key) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    };

    // Get sort direction icon
    const getSortDirectionArrow = (column) => {
      if (sortConfig.key !== column) return null;
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };
    
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant='h4' color="primary" fontWeight="medium">
            {props.name || 'Parsec Leo Report'} - User/Machine Assignments
          </Typography>
          
          <IconButton 
            color="primary" 
            onClick={() => exportToCSV(parsecinfo.data)}
            title="Export to CSV"
          >
            <DownloadIcon />
          </IconButton>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="medium">
                    {parsecinfo.data.length}
                  </Typography>
                </Box>
                <Badge 
                  badgeContent={parsecinfo.data.length} 
                  color="primary" 
                  max={999}
                  sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 24, minWidth: 24 } }}
                >
                  <PersonIcon fontSize="large" color="primary" />
                </Badge>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Online Users
                  </Typography>
                  <Typography variant="h4" fontWeight="medium">
                    {onlineUsers}
                  </Typography>
                </Box>
                <Badge 
                  badgeContent={onlineUsers} 
                  color="success" 
                  max={999}
                  sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 24, minWidth: 24 } }}
                >
                  <WifiIcon fontSize="large" color="success" />
                </Badge>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Connected Today
                  </Typography>
                  <Typography variant="h4" fontWeight="medium">
                    {connectedTodayUsers}
                  </Typography>
                </Box>
                <Badge 
                  badgeContent={connectedTodayUsers} 
                  color="info" 
                  max={999}
                  sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 24, minWidth: 24 } }}
                >
                  <CalendarTodayIcon fontSize="large" color="info" />
                </Badge>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Machines Without Users
                  </Typography>
                  <Typography variant="h4" fontWeight="medium">
                    {noLeoUsers}
                  </Typography>
                </Box>
                <Badge 
                  badgeContent={noLeoUsers} 
                  color="error" 
                  max={999}
                  sx={{ '& .MuiBadge-badge': { fontSize: 14, height: 24, minWidth: 24 } }}
                >
                  <ComputerIcon fontSize="large" color="error" />
                </Badge>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <Chip 
                    label={`${filteredData.length} results`} 
                    size="small" 
                    onDelete={() => setSearchTerm('')}
                  />
                </InputAdornment>
              )
            }}
            size="small"
          />
        </Box>

        {/* Data Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
          <TableContainer sx={{ maxHeight: '60vh' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    onClick={() => requestSort('host')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Host {getSortDirectionArrow('host')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('name')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Name {getSortDirectionArrow('name')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('email')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Email {getSortDirectionArrow('email')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('machine_online')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Status {getSortDirectionArrow('machine_online')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('last_connected')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Last Connected {getSortDirectionArrow('last_connected')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('leo_user')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Leo User {getSortDirectionArrow('leo_user')}
                  </TableCell>
                  <TableCell 
                    onClick={() => requestSort('leo_client_assignment')} 
                    sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Client Assignment {getSortDirectionArrow('leo_client_assignment')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row) => {
                  const isOnline = row.machine_online === 'Online';
                  const isConnectedToday = row.last_connected === today;
                  const noLeoUser = row.leo_user === 'No Leo User';
                  
                  return (
                    <TableRow 
                      key={uuid()}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        borderLeft: `3px solid ${isOnline ? '#4caf50' : noLeoUser ? '#f44336' : '#9e9e9e'}`
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {row.host}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.email || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={isOnline ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
                          label={row.machine_online || 'Unknown'} 
                          color={isOnline ? 'success' : 'default'}
                          size="small"
                          variant={isOnline ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.last_connected ? `Last connected on ${row.last_connected}` : 'Never connected'}>
                          <Chip 
                            icon={isConnectedToday ? <CalendarTodayIcon fontSize="small" /> : null}
                            label={isConnectedToday ? 'Today' : row.last_connected || 'Never'} 
                            color={isConnectedToday ? 'info' : 'default'}
                            size="small"
                            variant={isConnectedToday ? 'filled' : 'outlined'}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={noLeoUser ? 'No Leo User assigned' : `Leo User: ${row.leo_user}`}>
                          <Chip 
                            icon={noLeoUser ? <ErrorIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                            label={row.leo_user || 'None'} 
                            color={noLeoUser ? 'error' : 'secondary'}
                            size="small"
                            variant={noLeoUser ? 'outlined' : 'filled'}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.leo_client_assignment || 'None'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">No matching records found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        
        {/* Info footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <InfoIcon color="info" fontSize="small" />
          <Typography variant="caption" color="text.secondary">
            Showing {filteredData.length} of {parsecinfo.data.length} Parsec user/machine assignments. 
            Click on column headers to sort the data.
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Fallback
  return null;
}