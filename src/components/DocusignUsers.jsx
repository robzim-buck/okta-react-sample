import React, { useState, useMemo, useEffect } from 'react';
import {
  Typography, Container, Paper, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Chip, TextField, InputAdornment, FormControl,
  Select, MenuItem, InputLabel, TableSortLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useOktaAuth } from '@okta/okta-react';
import { useQuery } from '@tanstack/react-query';

export default function DocusignUsers(props) {
  // Always declare these hooks first, regardless of rendering path
  const { authState } = useOktaAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('userName');
  
  // Logging
  console.log("DocusignUsers component rendering");
  
  // Fetch data
  const {
    data: docusignUsers = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['docusignUsers'],
    queryFn: async () => {
      const response = await fetch('https://laxcoresrv.buck.local:8000/docusign/users', {
        headers: {
          'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000
  });
  
  // Extract unique user statuses - always call useMemo
  const userStatuses = useMemo(() => {
    if (!docusignUsers || docusignUsers.length === 0) return [];

    try {
      const statuses = [...new Set(
        docusignUsers
          .filter(user => user.user_status)
          .map(user => user.user_status)
      )];

      return statuses.map(status => ({
        id: status,
        name: status
      }));
    } catch (err) {
      console.error("Error processing statuses:", err);
      return [];
    }
  }, [docusignUsers]);

  // Get user initials
  const getUserInitials = (user) => {
    // Use first_name and last_name directly if available
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    // Fall back to user_name if first_name or last_name is not available
    else if (user.user_name) {
      const nameParts = user.user_name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0]) {
        return nameParts[0][0].toUpperCase();
      }
    }

    // Default fallback
    return 'DU'; // Docusign User
  };

  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrderBy(property);
    setOrder(newOrder);
  };

  // Function to get comparable value for sorting
  const getSortValue = (user, property) => {
    switch(property) {
      case 'userName':
        return (user.user_name || '').toLowerCase();
      case 'email':
        return (user.email || '').toLowerCase();
      case 'status':
        return (user.user_status || '').toLowerCase();
      case 'company':
        return (user.company || '').toLowerCase();
      default:
        return (user[property] || '').toLowerCase();
    }
  };

  // Filter and sort users - always call useMemo
  const filteredAndSortedUsers = useMemo(() => {
    // First apply filters
    let filtered = [...docusignUsers];

    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchableFields = [
          user.user_name,
          user.email,
          user.company,
          user.first_name,
          user.last_name,
          user.job_title,
          user.user_id
        ];

        return searchableFields.some(field =>
          field && String(field).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(user =>
        user.user_status === statusFilter
      );
    }
    
    // Then sort
    return stableSort(filtered, getComparator(order, orderBy));
  }, [docusignUsers, searchTerm, statusFilter, order, orderBy]);

  // Reference to filtered users (for count display)
  const filteredUsers = useMemo(() => {
    let filtered = [...docusignUsers];

    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchableFields = [
          user.user_name,
          user.email,
          user.company,
          user.first_name,
          user.last_name,
          user.job_title,
          user.user_id
        ];

        return searchableFields.some(field =>
          field && String(field).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(user =>
        user.user_status === statusFilter
      );
    }
    
    return filtered;
  }, [docusignUsers, searchTerm, statusFilter]);
  
  // Sorting functions
  function descendingComparator(a, b, orderBy) {
    const aValue = getSortValue(a, orderBy);
    const bValue = getSortValue(b, orderBy);
    
    // Handle null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  // Render loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Docusign Users'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Docusign Users'}
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#fff5f5' }}>
          <Typography color="error" variant="h6" gutterBottom>An error occurred</Typography>
          <Typography color="text.secondary">
            {error.message || "Failed to fetch Docusign users"}
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Render empty state
  if (!docusignUsers || docusignUsers.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
          {props.name || 'Docusign Users'}
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>No Users Found</Typography>
          <Typography color="text.secondary">
            No Docusign users were returned from the API.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Render main content
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
        {props.name || 'Docusign Users'}
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
          Successfully loaded {docusignUsers.length} Docusign users.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {userStatuses.map(status => {
            const count = docusignUsers.filter(user => user.status === status.id).length;
            if (count > 0) {
              return (
                <Chip 
                  key={status.id}
                  label={`${count} ${status.name}`}
                  color={status.id === 'active' ? 'success' : 'default'}
                  variant={statusFilter === status.id ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => setStatusFilter(statusFilter === status.id ? '' : status.id)}
                  sx={{ cursor: 'pointer' }}
                />
              );
            }
            return null;
          })}
        </Box>
      </Paper>
      
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
            <InputLabel id="user-status-filter-label">Status</InputLabel>
            <Select
              labelId="user-status-filter-label"
              id="user-status-filter"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {userStatuses.map(status => (
                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table size="small" key={`${orderBy}-${order}`}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'userName'}
                  direction={orderBy === 'userName' ? order : 'asc'}
                  onClick={() => handleRequestSort('userName')}
                >
                  Name {orderBy === 'userName' ? (order === 'asc' ? '↑' : '↓') : ''}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleRequestSort('email')}
                >
                  Email {orderBy === 'email' ? (order === 'asc' ? '↑' : '↓') : ''}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'company'}
                  direction={orderBy === 'company' ? order : 'asc'}
                  onClick={() => handleRequestSort('company')}
                >
                  Company {orderBy === 'company' ? (order === 'asc' ? '↑' : '↓') : ''}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status {orderBy === 'status' ? (order === 'asc' ? '↑' : '↓') : ''}
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedUsers.map((user, index) => {
              const isActive = user.user_status?.toLowerCase() === 'active';
              const uniqueKey = `docusign-user-${index}`;

              return (
                <TableRow key={uniqueKey}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: isActive ? '#2E7D32' : 'text.disabled',
                          width: 32,
                          height: 32
                        }}
                      >
                        {getUserInitials(user)}
                      </Avatar>
                      <Box>
                        {user.user_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                        {user.job_title && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {user.job_title}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.company || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.user_status || 'Unknown'}
                      color={isActive ? 'success' : 'default'}
                      size="small"
                      variant={isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredUsers.length === docusignUsers.length ? (
              `Showing all ${docusignUsers.length} users`
            ) : (
              <>
                Showing {filteredUsers.length} of {docusignUsers.length} users
                {statusFilter && ` (filtered by status: ${statusFilter})`}
                {searchTerm && ` (search: "${searchTerm}")`}
              </>
            )}
          </Typography>
        </Box>
      </TableContainer>
    </Container>
  );
}