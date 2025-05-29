import { 
  Chip, Typography, Box, Container, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Collapse, Tooltip, Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function Rapid7Jobs(props) {
    const [expanded, setExpanded] = useState({});
    
    const handleToggle = (jobId) => {
        setExpanded(prev => ({
            ...prev,
            [jobId]: !prev[jobId]
        }));
    };
    
    const [rapid7Jobs] = useQueries({
        queries: [
          {
            queryKey: ["rapid7Jobs"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/rapid7/jobs", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch Rapid7 jobs: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2
        },
        ]
    });

    if (rapid7Jobs.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (rapid7Jobs.error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Failed to load Rapid7 jobs</Typography>
                    <Typography variant="body2">{rapid7Jobs.error.message}</Typography>
                </Alert>
            </Container>
        );
    }
    
    if (rapid7Jobs.data) {
        const sortedData = Array.isArray(rapid7Jobs.data) 
            ? rapid7Jobs.data.sort((a, b) => {
                const dateA = new Date(a.started || a.created || 0);
                const dateB = new Date(b.started || b.created || 0);
                return dateB - dateA; // Most recent first
            })
            : [];
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Rapid7 jobs found</Typography>
                </Box>
            );
        }

        const completedJobs = sortedData.filter(job => 
            job.status && (job.status.toLowerCase().includes('complete') || job.status.toLowerCase().includes('finished'))
        ).length;
        
        const runningJobs = sortedData.filter(job => 
            job.status && (job.status.toLowerCase().includes('running') || job.status.toLowerCase().includes('active'))
        ).length;
        
        const failedJobs = sortedData.filter(job => 
            job.status && (job.status.toLowerCase().includes('failed') || job.status.toLowerCase().includes('error'))
        ).length;

        const getStatusColor = (status) => {
            const statusLower = status ? status.toLowerCase() : '';
            if (statusLower.includes('complete') || statusLower.includes('finished') || statusLower.includes('success')) return '#4caf50';
            if (statusLower.includes('running') || statusLower.includes('active') || statusLower.includes('progress')) return '#ff9800';
            if (statusLower.includes('failed') || statusLower.includes('error')) return '#f44336';
            return '#2196f3';
        };

        const getStatusChipColor = (status) => {
            const statusLower = status ? status.toLowerCase() : '';
            if (statusLower.includes('complete') || statusLower.includes('finished') || statusLower.includes('success')) return 'success';
            if (statusLower.includes('running') || statusLower.includes('active') || statusLower.includes('progress')) return 'warning';
            if (statusLower.includes('failed') || statusLower.includes('error')) return 'error';
            return 'default';
        };

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Rapid7 Jobs'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Jobs`} 
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
                                Total Jobs
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {completedJobs}
                            </Typography>
                            <Typography variant="body2">
                                Completed
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {runningJobs}
                            </Typography>
                            <Typography variant="body2">
                                Running
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {failedJobs}
                            </Typography>
                            <Typography variant="body2">
                                Failed
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
                                        <WorkIcon fontSize="small" />
                                        Job Name
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Type
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ScheduleIcon fontSize="small" />
                                        Duration
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        Started
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UpdateIcon fontSize="small" />
                                        Last Updated
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedData.map((job) => {
                                const jobKey = job.id || job.name || Math.random().toString();
                                const statusColor = getStatusColor(job.status);
                                const startedDate = job.started ? new Date(job.started) : null;
                                const updatedDate = job.updated || job.modified ? new Date(job.updated || job.modified) : null;
                                const duration = job.duration || (job.started && job.completed ? 
                                    new Date(job.completed) - new Date(job.started) : null);
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={jobKey}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                '&:hover': { bgcolor: 'action.selected' },
                                                borderLeft: `4px solid ${statusColor}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleToggle(jobKey)}
                                        >
                                            <TableCell>
                                                <IconButton size="small">
                                                    {expanded[jobKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {job.name || job.title || 'Unnamed Job'}
                                                </Typography>
                                                {job.id && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                        ID: {job.id}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="filled" 
                                                    color={getStatusChipColor(job.status)}
                                                    size="small"
                                                    label={job.status || 'Unknown'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small"
                                                    label={job.type || job.jobType || 'N/A'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {duration ? `${Math.round(duration / 1000 / 60)} min` : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {startedDate ? (
                                                    <Tooltip title={startedDate.toLocaleString()}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {startedDate.toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.floor((Date.now() - startedDate) / (1000 * 60 * 60 * 24))} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {updatedDate ? (
                                                    <Tooltip title={updatedDate.toLocaleString()}>
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {updatedDate.toLocaleDateString()}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.floor((Date.now() - updatedDate) / (1000 * 60 * 60 * 24))} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">N/A</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                <Collapse in={expanded[jobKey]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Grid container spacing={3}>
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Job ID
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {job.id || 'N/A'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Description
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {job.description || job.summary || 'No description available'}
                                                                </Typography>
                                                            </Grid>

                                                            {job.target && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Target
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                        {job.target}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {job.progress !== undefined && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Progress
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {job.progress}%
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {job.created && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Created
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(job.created).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {job.completed && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Completed
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(job.completed).toLocaleString()}
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
                                                                        {JSON.stringify(job, null, 2)}
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