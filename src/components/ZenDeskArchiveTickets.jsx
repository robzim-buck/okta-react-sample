import { 
  Chip, Typography, Box, Container, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Collapse, Tooltip, Card
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArchiveIcon from '@mui/icons-material/Archive';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function ZenDeskArchiveTickets(props) {
    const [expanded, setExpanded] = useState({});
    
    const handleToggle = (ticketId) => {
        setExpanded(prev => ({
            ...prev,
            [ticketId]: !prev[ticketId]
        }));
    };
    
    const [zendeskArchiveTickets] = useQueries({
        queries: [
          {
            queryKey: ["zendeskArchiveTickets"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/zendesk_archive_tix", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch archive tickets: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2
        },
        ]
    });

    if (zendeskArchiveTickets.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (zendeskArchiveTickets.error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Failed to load ZenDesk archive tickets</Typography>
                    <Typography variant="body2">{zendeskArchiveTickets.error.message}</Typography>
                </Alert>
            </Container>
        );
    }
    
    if (zendeskArchiveTickets.data) {
        const sortedData = Array.isArray(zendeskArchiveTickets.data) 
            ? zendeskArchiveTickets.data.sort((a, b) => {
                const dateA = new Date(a.updated_at || a.created_at || 0);
                const dateB = new Date(b.updated_at || b.created_at || 0);
                return dateB - dateA; // Most recent first
            })
            : [];
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No ZenDesk archive tickets found</Typography>
                </Box>
            );
        }

        const closedTickets = sortedData.filter(ticket => 
            ticket.status && ticket.status.toLowerCase().includes('closed')
        ).length;
        
        const urgentTickets = sortedData.filter(ticket => 
            ticket.priority && ticket.priority.toLowerCase().includes('urgent')
        ).length;
        
        const highPriorityTickets = sortedData.filter(ticket => 
            ticket.priority && ticket.priority.toLowerCase().includes('high')
        ).length;

        const getPriorityColor = (priority) => {
            const priorityLower = priority ? priority.toLowerCase() : '';
            if (priorityLower.includes('urgent')) return 'error';
            if (priorityLower.includes('high')) return 'warning';
            if (priorityLower.includes('normal')) return 'info';
            if (priorityLower.includes('low')) return 'success';
            return 'default';
        };

        const getStatusColor = (status) => {
            const statusLower = status ? status.toLowerCase() : '';
            if (statusLower.includes('closed') || statusLower.includes('solved')) return '#4caf50';
            if (statusLower.includes('pending')) return '#ff9800';
            if (statusLower.includes('open')) return '#2196f3';
            return '#757575';
        };

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'ZenDesk Archive Tickets'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Archive Tickets`} 
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
                                Total Archive Tickets
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {closedTickets}
                            </Typography>
                            <Typography variant="body2">
                                Closed
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {urgentTickets}
                            </Typography>
                            <Typography variant="body2">
                                Urgent
                            </Typography>
                        </Card>
                    </Grid>
                    
                    <Grid item size={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {highPriorityTickets}
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
                                        <ArchiveIcon fontSize="small" />
                                        Subject
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon fontSize="small" />
                                        Submitter
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Priority
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        Created
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UpdateIcon fontSize="small" />
                                        Updated
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedData.map((ticket) => {
                                const ticketKey = ticket.id || Math.random().toString();
                                const statusColor = getStatusColor(ticket.status);
                                const createdDate = ticket.created_at ? new Date(ticket.created_at) : null;
                                const updatedDate = ticket.updated_at ? new Date(ticket.updated_at) : null;
                                
                                return (
                                    <>
                                        <TableRow 
                                            key={ticketKey}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                '&:hover': { bgcolor: 'action.selected' },
                                                borderLeft: `4px solid ${statusColor}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleToggle(ticketKey)}
                                        >
                                            <TableCell>
                                                <IconButton size="small">
                                                    {expanded[ticketKey] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {ticket.subject || 'No Subject'}
                                                </Typography>
                                                {ticket.id && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                        ID: {ticket.id}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {ticket.submitter_name || ticket.requester_name || 'Unknown'}
                                                </Typography>
                                                {ticket.submitter_email && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                        {ticket.submitter_email}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="filled" 
                                                    color={getPriorityColor(ticket.priority)}
                                                    size="small"
                                                    label={ticket.priority || 'Normal'} 
                                                    icon={ticket.priority === 'urgent' ? <PriorityHighIcon fontSize="small" /> : undefined}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    variant="outlined" 
                                                    color="default"
                                                    size="small"
                                                    label={ticket.status || 'Unknown'} 
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
                                                <Collapse in={expanded[ticketKey]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ margin: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                        <Grid container spacing={3}>
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Ticket ID
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                                    {ticket.id || 'N/A'}
                                                                </Typography>
                                                            </Grid>
                                                            
                                                            <Grid item size={12} md={6}>
                                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                    Description
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {ticket.description || 'No description available'}
                                                                </Typography>
                                                            </Grid>

                                                            {ticket.assignee_name && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Assignee
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {ticket.assignee_name}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {ticket.organization_name && (
                                                                <Grid item size={12} md={6}>
                                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                        Organization
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        {ticket.organization_name}
                                                                    </Typography>
                                                                </Grid>
                                                            )}

                                                            {ticket.tags && ticket.tags.length > 0 && (
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
                                                                        {ticket.tags.map((tag, index) => (
                                                                            <Chip 
                                                                                key={`${ticketKey}-tag-${index}`}
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
                                                                        {JSON.stringify(ticket, null, 2)}
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