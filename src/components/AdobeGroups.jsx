import uuid from 'react-uuid';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import { Typography, Button, IconButton } from '@mui/material';
import { Chip, Grid, Box, Card, CardContent, Collapse, Paper } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export default function AdobeGroups(props) {
    const [groupFilter, setGroupFilter] = useState('');   
    const [typeFilter, setTypeFilter] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});

    const [adobeGroups] = useQueries({
        queries: [
          {
            queryKey: ["adobeGroups"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/adobe_groups").then((res) => res.json()),
        },
        ]
    });

    const clearGroupFilter = () => {
        setGroupFilter('');
    }
    
    const clearTypeFilter = () => {
        setTypeFilter('');
    }
    
    const toggleGroupExpand = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    }

    if (adobeGroups.isLoading) return <CircularProgress></CircularProgress>;
    if (adobeGroups.error) return "An error has occurred: " + adobeGroups.error.message;
    if (adobeGroups.data) {
        // Sort data by group name
        let sortedData = adobeGroups.data.sort((a, b) => a.groupName.localeCompare(b.groupName));
        
        // Initialize filtered data
        let filteredData = sortedData;
        
        // Apply filters if they exist
        if (groupFilter.length > 0) {
            filteredData = filteredData.filter((f) => f.groupName.toLowerCase().includes(groupFilter.toLowerCase()));
        }

        if (typeFilter.length > 0) {
            filteredData = filteredData.filter((f) => f.type.toLowerCase().includes(typeFilter.toLowerCase()));
        }

        // Count different group types for summary
        const typeCount = (list, type) => {
            return list.reduce((counter, item) => item.type === type ? ++counter : counter, 0);
        };

        // Get unique types for displaying in summary
        const uniqueTypes = [...new Set(sortedData.map(item => item.type))];

        return (
            <>
            <Box sx={{ margin: 2 }}>
                <Typography variant='h4' color="primary" gutterBottom>
                    {props.name} Groups
                </Typography>
                
                <Card 
                    variant="outlined" 
                    sx={{ 
                        mb: 4, 
                        p: 2, 
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 2
                    }}
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Groups Summary</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {uniqueTypes.map(type => (
                                    <Chip 
                                        key={type}
                                        label={`${typeCount(sortedData, type)} ${type}`} 
                                        color="secondary" 
                                        variant="outlined" 
                                        size="small"
                                    />
                                ))}
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                    label={`${sortedData.length} Total Groups`}
                                    color="primary"
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Filters</Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                                            Group Filter:
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <input 
                                                id="groupfilter"
                                                name="groupfilter"
                                                type="text"
                                                value={groupFilter}
                                                placeholder="Filter by group name..."
                                                onChange={event => setGroupFilter(event.target.value)}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '8px 12px', 
                                                    border: '1px solid #ccc', 
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Box>
                                        <Button 
                                            onClick={clearGroupFilter} 
                                            size="small" 
                                            variant="outlined" 
                                            color="secondary"
                                            disabled={!groupFilter}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                                            Type Filter:
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <input 
                                                id="typefilter"
                                                name="typefilter"
                                                type="text"
                                                value={typeFilter}
                                                placeholder="Filter by group type..."
                                                onChange={event => setTypeFilter(event.target.value)}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '8px 12px', 
                                                    border: '1px solid #ccc', 
                                                    borderRadius: '4px' 
                                                }}
                                            />
                                        </Box>
                                        <Button 
                                            onClick={clearTypeFilter} 
                                            size="small" 
                                            variant="outlined" 
                                            color="secondary"
                                            disabled={!typeFilter}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>

                {/* Check if we have groups */}
                {!filteredData || filteredData.length === 0 ? (
                    <Typography>No groups found with the current filters</Typography>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color="primary">
                                Found {filteredData.length} groups
                            </Typography>
                            <Chip 
                                label={`${filteredData.length} Groups`} 
                                color="primary" 
                                variant="outlined" 
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                        
                        {filteredData.map(group => {
                            if (!group || !group.groupName) return null;
                            
                            const isExpanded = expandedGroups[group.groupId] || false;
                            
                            return (
                                <Card 
                                    key={uuid()} 
                                    variant="outlined" 
                                    sx={{ 
                                        mb: 2, 
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        borderLeft: '4px solid #4caf50',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ py: 2 }}>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={12} md={5}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box 
                                                        sx={{ 
                                                            width: 40, 
                                                            height: 40, 
                                                            borderRadius: '50%', 
                                                            bgcolor: 'primary.light', 
                                                            display: 'flex', 
                                                            justifyContent: 'center', 
                                                            alignItems: 'center',
                                                            mr: 2,
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {group.groupName.charAt(0).toUpperCase()}
                                                    </Box>
                                                    <Typography 
                                                        variant="body1" 
                                                        sx={{ 
                                                            fontWeight: 'medium',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {group.groupName}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            
                                            <Grid item xs={12} md={5}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    <Chip 
                                                        label={group.type} 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="secondary"
                                                    />
                                                    <Chip 
                                                        label={`${group.memberCount} members`} 
                                                        size="small" 
                                                        variant="outlined"
                                                        color="info"
                                                    />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    ID: {group.groupId}
                                                </Typography>
                                            </Grid>
                                            
                                            <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                                <Button 
                                                    aria-label={isExpanded ? 'Hide Details' : 'Show Details'}
                                                    size="small"
                                                    variant="contained"
                                                    color={isExpanded ? "secondary" : "primary"}
                                                    onClick={() => toggleGroupExpand(group.groupId)}
                                                    sx={{ 
                                                        minWidth: 100,
                                                        borderRadius: 8
                                                    }}
                                                >
                                                    {isExpanded ? 'Hide' : 'Show'}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        
                                        <Collapse in={isExpanded}>
                                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                                                    Group Details
                                                </Typography>
                                                
                                                <Card 
                                                    variant="outlined" 
                                                    sx={{ 
                                                        mb: 2, 
                                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                                        borderColor: 'rgba(0,0,0,0.09)'
                                                    }}
                                                >
                                                    <CardContent sx={{ py: 2 }}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Admin Group Name
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                    {group.adminGroupName ? group.adminGroupName : 'None'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Profile Group Name
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {group.profileGroupName ? group.profileGroupName : 'None'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Member Count
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {group.memberCount} members
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Group Type
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {group.type}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item xs={12} sm={6} md={4}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Group ID
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {group.groupId}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Card>
                                            </Box>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </>
                )}
            </Box>
            </>
        );
    }
    return (
        <>
        <Typography variant='h3'>{props.name} Groups</Typography>
        <Box sx={{ display: 'flex' }}>
            <CircularProgress color="inherit"></CircularProgress>
        </Box>
        </>
    );
}