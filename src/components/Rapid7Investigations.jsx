import { 
  Chip, Typography, Box, Container, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Collapse, Tooltip, Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function Rapid7Investigations(props) {
    const [expanded, setExpanded] = useState({});
    
    const handleToggle = (investigationId) => {
        setExpanded(prev => ({
            ...prev,
            [investigationId]: !prev[investigationId]
        }));
    };
    
    const [rapid7Investigations] = useQueries({
        queries: [
          {
            queryKey: ["rapid7Investigations"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/rapid7/investigations", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch Rapid7 investigations: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2
        },
        ]
    });

    if (rapid7Investigations.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (rapid7Investigations.error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Failed to load Rapid7 investigations</Typography>
                    <Typography variant="body2">{rapid7Investigations.error.message}</Typography>
                </Alert>
            </Container>
        );
    }
    
    if (rapid7Investigations.data) {
        const sortedData = Array.isArray(rapid7Investigations.data) 
            ? rapid7Investigations.data.sort((a, b) => {
                const dateA = new Date(a.started || a.created || 0);
                const dateB = new Date(b.started || b.created || 0);
                return dateB - dateA; // Most recent first
            })
            : [];
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Rapid7 investigations found</Typography>
                </Box>
            );
        }

        const completedInvestigations = sortedData.filter(investigation => 
            investigation.status && (investigation.status.toLowerCase().includes('complete') || investigation.status.toLowerCase().includes('closed') || investigation.status.toLowerCase().includes('resolved'))
        ).length;
        
        const activeInvestigations = sortedData.filter(investigation => 
            investigation.status && (investigation.status.toLowerCase().includes('active') || investigation.status.toLowerCase().includes('open') || investigation.status.toLowerCase().includes('in progress'))
        ).length;
        
        const urgentInvestigations = sortedData.filter(investigation => 
            investigation.priority && (investigation.priority.toLowerCase().includes('high') || investigation.priority.toLowerCase().includes('urgent') || investigation.priority.toLowerCase().includes('critical'))
        ).length;

        const getStatusColor = (status) => {
            const statusLower = status ? status.toLowerCase() : '';
            if (statusLower.includes('complete') || statusLower.includes('closed') || statusLower.includes('resolved')) return '#4caf50';
            if (statusLower.includes('active') || statusLower.includes('open') || statusLower.includes('in progress')) return '#ff9800';
            if (statusLower.includes('escalated') || statusLower.includes('urgent')) return '#f44336';
            return '#2196f3';
        };

        const getStatusChipColor = (status) => {
            const statusLower = status ? status.toLowerCase() : '';
            if (statusLower.includes('complete') || statusLower.includes('closed') || statusLower.includes('resolved')) return 'success';
            if (statusLower.includes('active') || statusLower.includes('open') || statusLower.includes('in progress')) return 'warning';
            if (statusLower.includes('escalated') || statusLower.includes('urgent')) return 'error';
            return 'default';
        };

        const getPriorityChipColor = (priority) => {
            const priorityLower = priority ? priority.toLowerCase() : '';
            if (priorityLower.includes('critical') || priorityLower.includes('urgent')) return 'error';
            if (priorityLower.includes('high')) return 'warning';
            if (priorityLower.includes('medium')) return 'info';
            if (priorityLower.includes('low')) return 'success';
            return 'default';
        };

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Rapid7 Investigations'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Investigations`} 
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
                                Total Investigations
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {activeInvestigations}
                            </Typography>
                            <Typography variant="body2">
                                Active
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {completedInvestigations}
                            </Typography>
                            <Typography variant="body2">
                                Completed
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {urgentInvestigations}
                            </Typography>
                            <Typography variant="body2">
                                High Priority
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
                                        <SearchIcon fontSize="small" />
                                        Investigation
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Source
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Disposition
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        Created_Time
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedData.map((investigation) => {
                                const investigationKey = investigation.id || investigation.name || Math.random().toString();
                                const statusColor = getStatusColor(investigation.status);
                                const createdDate = investigation.created_time || investigation.created ? new Date(investigation.created_time || investigation.created) : null;
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={investigationKey}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                '&:hover': { bgcolor: 'action.selected' },
                                                borderLeft: `4px solid ${statusColor}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleToggle(investigationKey)}
                                        >
                                            <TableCell>
                                                <IconButton size="small">
                                                    {expanded[investigationKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {investigation.name || investigation.title || 'Unnamed Investigation'}
                                                </Typography>
                                                {investigation.id && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                        ID: {investigation.id}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="filled" 
                                                    color={getStatusChipColor(investigation.status)}
                                                    size="small"
                                                    label={investigation.status || 'Unknown'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="outlined" 
                                                    color="info" 
                                                    size="small"
                                                    label={investigation.source || 'N/A'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small"
                                                    label={investigation.disposition || 'N/A'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {createdDate ? (
                                                    <Tooltip title={createdDate.toLocaleString()}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {createdDate.toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24))} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                <Collapse in={expanded[investigationKey]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Grid container spacing={3}>
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Investigation ID
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {investigation.id || 'N/A'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Description
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {investigation.description || investigation.summary || 'No description available'}
                                                                </Typography>
                                                            </Grid>

                                                            {investigation.assignee && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Assignee
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {investigation.assignee}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {investigation.source && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Source
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {investigation.source}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {investigation.tags && investigation.tags.length > 0 && (
                                                                <Grid item size={12}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Tags
                                                                    </Typography>
                                                                    <Box sx={{ 
                                                                        display: 'flex', 
                                                                        flexWrap: 'wrap',
                                                                        gap: 1,
                                                                        width: '100%'
                                                                    }}>
                                                                        {investigation.tags.map((tag, index) => (
                                                                            <Chip 
                                                                                key={`${investigationKey}-tag-${index}`}
                                                                                variant="outlined" 
                                                                                color="info" 
                                                                                size="small"
                                                                                label={tag}
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

                                                            {investigation.created && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Created
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(investigation.created).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {investigation.closed && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Closed
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(investigation.closed).toLocaleString()}
                                                                    </Typography>
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
                                                                        {JSON.stringify(investigation, null, 2)}
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