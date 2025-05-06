import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import { 
  Typography, Box, Container, Grid, 
  Card, CardContent, Chip, Divider,
  Paper, TextField, InputAdornment,
  Avatar, Tooltip, IconButton,
  Collapse, Button, CircularProgress, Alert, AlertTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  ClearAll as ClearAllIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Group as GroupIcon,
  ContentCopy as ContentCopyIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';


export default function OktaGroups(props) {
    // State for search and expanded items
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [copiedText, setCopiedText] = useState('');
    
    // Toggle group expansion
    const toggleGroupExpand = (groupId) => {
      setExpandedGroups(prev => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    };
    
    // Function to handle clearing the search filter
    const handleClearFilter = () => {
      setSearchTerm('');
    };
    
    // Copy text to clipboard function
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedText(text);
          setTimeout(() => setCopiedText(''), 2000);
        })
        .catch(err => console.error('Failed to copy: ', err));
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
    const [oktaGroups] = useQueries({
        queries: [
          {
            queryKey: ["oktagroups"],
            queryFn: async () => {
              try {
                const res = await fetch("https://laxcoresrv.buck.local:8000/buckokta/category/att/comparison/match?_category=groups");
                if (!res.ok) {
                  throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
              } catch (error) {
                console.error("Error fetching groups:", error);
                throw error;
              }
            },
            retry: 2,
            retryDelay: 1000,
          }
        ]
    });
    // Loading state
    if (oktaGroups.isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    {props.name || 'Okta Groups'}
                </Typography>
                
                {/* Loading skeleton */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading group data...</Typography>
                </Box>
            </Container>
        );
    }
    
    // Error state
    if (oktaGroups.error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    {props.name || 'Okta Groups'}
                </Typography>
                <Paper sx={{ p: 3, bgcolor: '#fff5f5' }}>
                    <Typography color="error" variant="h6" gutterBottom>An error occurred</Typography>
                    <Typography color="text.secondary">
                        {oktaGroups.error.message || JSON.stringify(oktaGroups.error)}
                    </Typography>
                </Paper>
            </Container>
        );
    }
    
    // Data state
    if (oktaGroups.data) {
        // Not found state
        if (oktaGroups.data.detail === "Not Found") {
            return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                        {props.name || 'Okta Groups'}
                    </Typography>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">No group data found</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            The API returned a "Not Found" response.
                        </Typography>
                    </Paper>
                </Container>
            );
        }
        
        // No data or empty array state
        if (!oktaGroups.data || !Array.isArray(oktaGroups.data) || oktaGroups.data.length === 0) {
            return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                        {props.name || 'Okta Groups'}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>No Groups Found</AlertTitle>
                        No group data is available. The API returned an empty response.
                    </Alert>
                </Container>
            );
        }
        try {
            // Apply search filter
            let filteredGroups = Array.isArray(oktaGroups.data) ? oktaGroups.data : [];
            
            if (searchTerm) {
                filteredGroups = filteredGroups.filter(group => {
                    const searchableFields = [
                        group.profile?.name,
                        group.profile?.description,
                        group.id
                    ];
                    
                    return searchableFields.some(field => 
                        field && field.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                });
            }
            
            return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant='h4' color="primary" fontWeight="medium">
                            {props.name || 'Okta Groups'}
                            <Typography component="span" variant="subtitle1" sx={{ ml: 1 }}>
                                ({filteredGroups.length} Groups)
                            </Typography>
                        </Typography>
                    </Box>
                    
                    {/* Search Bar */}
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            placeholder="Search groups..."
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
                                        <IconButton size="small" onClick={handleClearFilter}>
                                            <ClearAllIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                    
                    {/* Groups List */}
                    {filteredGroups.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>No groups match your search</Typography>
                            <Button 
                                variant="outlined" 
                                onClick={handleClearFilter}
                                startIcon={<ClearAllIcon />}
                                sx={{ mt: 2 }}
                            >
                                Clear Search
                            </Button>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {filteredGroups.map((group) => {
                                const isExpanded = expandedGroups[group.id] || false;
                                
                                return (
                                    <Grid item xs={12} key={group.id}>
                                        <Card variant="outlined" sx={{ mb: 1 }}>
                                            <CardContent sx={{ p: 2 }}>
                                                {/* Group summary - always visible */}
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'space-between',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => toggleGroupExpand(group.id)}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                            <GroupIcon />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle1">
                                                                {group.profile?.name || 'Unnamed Group'}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {group.profile?.description || 'No description'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Chip 
                                                            size="small"
                                                            variant="outlined"
                                                            label={formatDate(group.created)}
                                                            icon={<CalendarIcon fontSize="small" />}
                                                        />
                                                        <IconButton 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleGroupExpand(group.id);
                                                            }}
                                                        >
                                                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                                
                                                {/* Expandable details */}
                                                <Collapse in={isExpanded}>
                                                    <Divider sx={{ my: 2 }} />
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Basic Information
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                    <Typography variant="body2" fontWeight="medium">Group ID</Typography>
                                                                    <Box sx={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: 0.5,
                                                                        fontFamily: 'monospace',
                                                                        fontSize: '0.8rem',
                                                                        maxWidth: '250px',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    }}>
                                                                        {group.id}
                                                                        <Tooltip title={copiedText === group.id ? "Copied!" : "Copy to clipboard"}>
                                                                            <IconButton 
                                                                                size="small" 
                                                                                onClick={() => copyToClipboard(group.id)}
                                                                                color={copiedText === group.id ? "success" : "default"}
                                                                            >
                                                                                <ContentCopyIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                </Box>
                                                                
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                    <Typography variant="body2" fontWeight="medium">Name</Typography>
                                                                    <Typography variant="body2">{group.profile?.name || 'N/A'}</Typography>
                                                                </Box>
                                                                
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <Typography variant="body2" fontWeight="medium">Description</Typography>
                                                                    <Typography variant="body2" sx={{ maxWidth: '250px', textAlign: 'right' }}>
                                                                        {group.profile?.description || 'No description provided'}
                                                                    </Typography>
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                        
                                                        <Grid item xs={12} sm={6}>
                                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Timestamps
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                    <Typography variant="body2" fontWeight="medium">Created</Typography>
                                                                    <Chip 
                                                                        size="small" 
                                                                        variant="outlined" 
                                                                        label={formatDate(group.created)}
                                                                    />
                                                                </Box>
                                                                
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                    <Typography variant="body2" fontWeight="medium">Last Updated</Typography>
                                                                    <Chip 
                                                                        size="small" 
                                                                        variant="outlined" 
                                                                        label={formatDate(group.lastUpdated)}
                                                                    />
                                                                </Box>
                                                                
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography variant="body2" fontWeight="medium">Membership Updated</Typography>
                                                                    <Chip 
                                                                        size="small" 
                                                                        variant="outlined" 
                                                                        label={formatDate(group.lastMembershipUpdated)}
                                                                    />
                                                                </Box>
                                                            </Paper>
                                                        </Grid>
                                                    </Grid>
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
                            Showing {filteredGroups.length} of {oktaGroups.data.length} groups
                            {searchTerm && ` • Search: "${searchTerm}"`}
                        </Typography>
                    </Box>
                </Container>
            );
        } catch (error) {
            console.error("Error rendering groups:", error);
            return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                        {props.name || 'Okta Groups'}
                    </Typography>
                    <Alert severity="error" sx={{ mt: 2 }}>
                        <AlertTitle>Error Processing Data</AlertTitle>
                        There was an error processing the group data. Please try refreshing the page.
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Error details: {error.message}
                        </Typography>
                    </Alert>
                </Container>
            );
        }
    
    }

}

