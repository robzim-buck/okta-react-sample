import { 
  Chip, Typography, Box, Container, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Collapse, Tooltip, Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function HammerSpaceProjects(props) {
    const [expanded, setExpanded] = useState({});
    
    const handleToggle = (projectId) => {
        setExpanded(prev => ({
            ...prev,
            [projectId]: !prev[projectId]
        }));
    };
    
    const [hammerspaceProjects] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceProjects"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/hammerspace/projects", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch projects: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2
        },
        ]
    });

    if (hammerspaceProjects.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (hammerspaceProjects.error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Failed to load Hammerspace projects</Typography>
                    <Typography variant="body2">{hammerspaceProjects.error.message}</Typography>
                </Alert>
            </Container>
        );
    }
    
    if (hammerspaceProjects.data) {
        const sortedData = Array.isArray(hammerspaceProjects.data) 
            ? hammerspaceProjects.data.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            : [];
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Hammerspace projects found</Typography>
                </Box>
            );
        }

        const activeProjects = sortedData.filter(project => 
            project.status && project.status.toLowerCase().includes('active')
        ).length;
        
        const projectTypes = [...new Set(sortedData.map(project => project.type).filter(Boolean))];
        const totalSize = sortedData.reduce((sum, project) => 
            sum + (project.size || 0), 0
        );

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Hammerspace Projects'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Projects`} 
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
                                Total Projects
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {activeProjects}
                            </Typography>
                            <Typography variant="body2">
                                Active Projects
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {projectTypes.length}
                            </Typography>
                            <Typography variant="body2">
                                Project Types
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {(totalSize / (1024 * 1024 * 1024)).toFixed(1)}
                            </Typography>
                            <Typography variant="body2">
                                Total Size (GB)
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
                                        <FolderIcon fontSize="small" />
                                        Name
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" />
                                        Description
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Type
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Size
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedData.map((project) => {
                                const projectKey = project.id || project.name || Math.random().toString();
                                const isActive = project.status && project.status.toLowerCase().includes('active');
                                const statusColor = isActive ? '#4caf50' : '#2196f3';
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={projectKey}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                '&:hover': { bgcolor: 'action.selected' },
                                                borderLeft: `4px solid ${statusColor}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleToggle(projectKey)}
                                        >
                                            <TableCell>
                                                <IconButton size="small">
                                                    {expanded[projectKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {project.name || 'Unnamed Project'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={project.description || 'No description'}>
                                                    <Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>
                                                        {project.description || 'No description'}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="filled" 
                                                    color={isActive ? "success" : "default"}
                                                    size="small"
                                                    label={project.status || 'Unknown'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="outlined" 
                                                    color="secondary" 
                                                    size="small"
                                                    label={project.type || 'N/A'} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {project.size ? `${(project.size / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                <Collapse in={expanded[projectKey]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Grid container spacing={3}>
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Project ID
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {project.id || 'N/A'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Full Description
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {project.description || 'No description available'}
                                                                </Typography>
                                                            </Grid>

                                                            {project.created && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Created
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(project.created).toLocaleString()}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {project.modified && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Last Modified
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {new Date(project.modified).toLocaleString()}
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
                                                                        {JSON.stringify(project, null, 2)}
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