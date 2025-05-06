import { 
  Chip, Typography, Divider, Paper, Box, Container,
  Grid, Card, CardContent, CardHeader, Button,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import uuid from 'react-uuid';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function HammerspaceShares(props) {
    const [expanded, setExpanded] = useState({});
    
    // Toggle expansion state for a specific share
    const handleToggle = (shareId) => {
        setExpanded(prev => ({
            ...prev,
            [shareId]: !prev[shareId]
        }));
    };
    
    const [hammerspaceShares] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceShares"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=shares",
                {
                methood: "GET",
                headers: {"x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                }
              },
            ).then((res) => res.json()),
        },
        ]
    });

    if (hammerspaceShares.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (hammerspaceShares.error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>An error has occurred</Typography>
                <Typography color="text.secondary">{hammerspaceShares.error.message}</Typography>
            </Box>
        );
    }
    
    if (hammerspaceShares.data) {
        const sortedData = hammerspaceShares.data.sort((a, b) => a.name.localeCompare(b.name));
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Hammerspace shares found</Typography>
                </Box>
            );
        }

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Hammerspace Shares'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Shares`} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Grid container spacing={3}>
                    {sortedData.map((shareItem) => {
                        // Calculate objective count
                        const objectiveCount = shareItem.shareObjectives ? shareItem.shareObjectives.length : 0;
                        
                        // Determine status color based on share state
                        const getStatusColor = (state) => {
                            const stateLower = state ? state.toLowerCase() : '';
                            if (stateLower.includes('active') || stateLower.includes('online')) return '#4caf50';
                            if (stateLower.includes('warn') || stateLower.includes('partial')) return '#ff9800';
                            if (stateLower.includes('error') || stateLower.includes('offline')) return '#f44336';
                            return '#2196f3'; // default blue
                        };
                        
                        const statusColor = getStatusColor(shareItem.shareState);
                        
                        return (
                            <Grid item xs={12} key={uuid()}>
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
                                            expanded={expanded[shareItem.name] || false}
                                            onChange={() => handleToggle(shareItem.name)}
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
                                                            {expanded[shareItem.name] ? 'Hide Details' : 'Show Details'}
                                                        </Button>
                                                    </Box>
                                                }
                                                sx={{ px: 3, py: 2 }}
                                            >
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} md={4}>
                                                        <Typography variant='h6'>
                                                            {shareItem.name}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                                            <Chip 
                                                                variant="filled" 
                                                                color="success" 
                                                                size="small"
                                                                label="Path" 
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                            <Typography variant="body2" noWrap sx={{ maxWidth: '180px' }}>
                                                                {shareItem.path}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <Chip 
                                                                variant="filled" 
                                                                color="info" 
                                                                size="small"
                                                                label="State" 
                                                            />
                                                            <Typography variant="body2">
                                                                {shareItem.shareState}
                                                            </Typography>
                                                            
                                                            {objectiveCount > 0 && (
                                                                <Chip 
                                                                    variant="outlined" 
                                                                    color="secondary" 
                                                                    size="small"
                                                                    label={`${objectiveCount} Objectives`} 
                                                                    sx={{ ml: 1 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            
                                            {shareItem.shareObjectives && shareItem.shareObjectives.length > 0 && (
                                                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                                    <Divider sx={{ mb: 2 }} />
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                        Share Objectives
                                                    </Typography>
                                                    
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                        {shareItem.shareObjectives.map(objective => (
                                                            <Chip 
                                                                key={uuid()} 
                                                                variant="outlined" 
                                                                color="secondary" 
                                                                size="small"
                                                                label={objective.objective.name}
                                                            />
                                                        ))}
                                                    </Box>
                                                </AccordionDetails>
                                            )}
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