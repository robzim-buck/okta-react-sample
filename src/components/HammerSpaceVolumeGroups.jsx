import { 
  Chip, Typography, Box, Container, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Collapse, Tooltip, Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import StorageIcon from '@mui/icons-material/Storage';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function HammerSpaceVolumeGroups(props) {
    const [expanded, setExpanded] = useState({});
    
    const handleToggle = (volumeGroupId) => {
        setExpanded(prev => ({
            ...prev,
            [volumeGroupId]: !prev[volumeGroupId]
        }));
    };
    
    const [hammerspaceVolumeGroups] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceVolumeGroups"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=volume-groups", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch volume groups: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2
        },
        ]
    });

    if (hammerspaceVolumeGroups.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (hammerspaceVolumeGroups.error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Failed to load Hammerspace volume groups</Typography>
                    <Typography variant="body2">{hammerspaceVolumeGroups.error.message}</Typography>
                </Alert>
            </Container>
        );
    }
    
    if (hammerspaceVolumeGroups.data) {
        const sortedData = Array.isArray(hammerspaceVolumeGroups.data) 
            ? hammerspaceVolumeGroups.data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            : [];
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Hammerspace volume groups found</Typography>
                </Box>
            );
        }

        const activeVolumeGroups = sortedData.filter(volumeGroup => 
            volumeGroup.status && volumeGroup.status.toLowerCase().includes('active')
        ).length;
        
        const totalCapacity = sortedData.reduce((sum, volumeGroup) => 
            sum + (volumeGroup.capacity || 0), 0
        );

        const totalVolumeCount = sortedData.reduce((sum, volumeGroup) => 
            sum + (volumeGroup.volumeCount || 0), 0
        );

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Hammerspace Volume Groups'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Volume Groups`} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {sortedData.length}
                            </Typography>
                            <Typography variant="body2">
                                Total Volume Groups
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {activeVolumeGroups}
                            </Typography>
                            <Typography variant="body2">
                                Active Groups
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {totalVolumeCount}
                            </Typography>
                            <Typography variant="body2">
                                Total Volumes
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {(totalCapacity / (1024 * 1024 * 1024)).toFixed(1)}
                            </Typography>
                            <Typography variant="body2">
                                Total Capacity (GB)
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <Table sx={{ minWidth: 650 }} size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold', width: '40px' }}>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <GroupWorkIcon fontSize="small" />
                                        Name
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Type
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StorageIcon fontSize="small" />
                                        Volumes
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Capacity
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        Added
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UpdateIcon fontSize="small" />
                                        Last Modified
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedData.map((volumeGroup) => {
                                const volumeGroupKey = volumeGroup.id || volumeGroup.name || Math.random().toString();
                                const isActive = volumeGroup.status && volumeGroup.status.toLowerCase().includes('active');
                                const statusColor = isActive ? '#4caf50' : '#2196f3';
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={volumeGroupKey}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                '&:hover': { bgcolor: 'action.selected' },
                                                borderLeft: `4px solid ${statusColor}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleToggle(volumeGroupKey)}
                                        >
                                            <TableCell>
                                                <IconButton size="small">
                                                    {expanded[volumeGroupKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {volumeGroup.name || 'Unnamed Volume Group'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small"
                                                    label={volumeGroup.type || 'N/A'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="filled" 
                                                    color={isActive ? "success" : "default"}
                                                    size="small"
                                                    label={volumeGroup.status || 'Unknown'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {volumeGroup.volumeCount || 0}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {volumeGroup.capacity ? `${(volumeGroup.capacity / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {volumeGroup.created ? (
                                                    <Tooltip title={new Date(volumeGroup.created).toLocaleString()}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {new Date(volumeGroup.created).toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.floor((Date.now() - new Date(volumeGroup.created)) / (1000 * 60 * 60 * 24))} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {volumeGroup.modified ? (
                                                    <Tooltip title={new Date(volumeGroup.modified).toLocaleString()}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {new Date(volumeGroup.modified).toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.floor((Date.now() - new Date(volumeGroup.modified)) / (1000 * 60 * 60 * 24))} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                                <Collapse in={expanded[volumeGroupKey]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Grid container spacing={3}>
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Volume Group ID
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {volumeGroup.id || 'N/A'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Description
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {volumeGroup.description || 'No description available'}
                                                                </Typography>
                                                            </Grid>

                                                            {volumeGroup.created && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Created
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(volumeGroup.created).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {volumeGroup.modified && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Last Modified
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(volumeGroup.modified).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {volumeGroup.volumes && volumeGroup.volumes.length > 0 && (
                                                                <Grid item size={12}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Volumes
                                                                    </Typography>
                                                                    <Box sx={{ 
                                                                        display: 'flex', 
                                                                        flexWrap: 'wrap',
                                                                        gap: 1,
                                                                        width: '100%'
                                                                    }}>
                                                                        {volumeGroup.volumes.map((volume, index) => (
                                                                            <Chip 
                                                                                key={`${volumeGroupKey}-vol-${index}`}
                                                                                variant="outlined" 
                                                                                color="info" 
                                                                                size="small"
                                                                                label={volume.name || `Volume ${index + 1}`}
                                                                                sx={{ 
                                                                                    whiteSpace: 'normal', 
                                                                                    height: 'auto',
                                                                                    '& .MuiChip-label': { 
                                                                                        whiteSpace: 'normal', 
                                                                                        wordWrap: 'break-word' 
                                                                                    } 
                                                                                }}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                </Grid>
                                                            )}

                                                            <Grid item size={12}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Raw Data
                                                                </Typography>
                                                                <Box sx={{ 
                                                                    p: 1, 
                                                                    bgcolor: 'white', 
                                                                    borderRadius: 1, 
                                                                    maxHeight: 200, 
                                                                    overflow: 'auto',
                                                                    border: '1px solid',
                                                                    borderColor: 'grey.300'
                                                                }}>
                                                                    <pre style={{ 
                                                                        margin: 0, 
                                                                        fontSize: '0.75rem', 
                                                                        whiteSpace: 'pre-wrap',
                                                                        fontFamily: 'monospace'
                                                                    }}>
                                                                        {JSON.stringify(volumeGroup, null, 2)}
                                                                    </pre>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        );
    }
    
    return null;
}