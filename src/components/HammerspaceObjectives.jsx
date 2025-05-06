import { 
  Chip, Typography, Divider, Box, Container,
  Grid, Card, CardContent, CardHeader, Button,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import uuid from 'react-uuid';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function HammerspaceObjectives(props) {
    const [expanded, setExpanded] = useState({});
    
    // Toggle expansion state for a specific objective
    const handleToggle = (objectiveId) => {
        setExpanded(prev => ({
            ...prev,
            [objectiveId]: !prev[objectiveId]
        }));
    };
    
    const [hammerspaceObjectives] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceObjectives"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=objectives",
                {
                methood: "GET",
                headers: {"x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                }
              },).then((res) => res.json()),
        },
        ]
    });

    if (hammerspaceObjectives.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (hammerspaceObjectives.error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>An error has occurred</Typography>
                <Typography color="text.secondary">{hammerspaceObjectives.error.message}</Typography>
            </Box>
        );
    }
    
    if (hammerspaceObjectives.data) {
        const sortedData = hammerspaceObjectives.data.sort((a, b) => a.name.localeCompare(b.name));
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Hammerspace objectives found</Typography>
                </Box>
            );
        }

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Hammerspace Objectives'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Objectives`} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Grid container spacing={3}>
                    {sortedData.map((objective) => {
                        // Calculate time since creation and modification
                        const createdDate = new Date(objective.created);
                        const modifiedDate = new Date(objective.modified);
                        const daysSinceCreation = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
                        const isRecent = daysSinceCreation < 7; // Consider "recent" if created in the last 7 days
                        
                        return (
                            <Grid item xs={12} key={uuid()}>
                                <Card 
                                    variant="outlined" 
                                    sx={{ 
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                        transition: 'all 0.2s ease-in-out',
                                        borderLeft: isRecent ? '4px solid #4caf50' : '4px solid #2196f3',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 0 }}>
                                        <Accordion 
                                            expanded={expanded[objective.name] || false}
                                            onChange={() => handleToggle(objective.name)}
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
                                                            {expanded[objective.name] ? 'Hide Details' : 'Show Details'}
                                                        </Button>
                                                    </Box>
                                                }
                                                sx={{ px: 3, py: 2 }}
                                            >
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant='h6'>
                                                            {objective.name}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                                            {isRecent && (
                                                                <Chip 
                                                                    variant="filled" 
                                                                    color="success" 
                                                                    size="small"
                                                                    label="New" 
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            
                                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Created
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="info" 
                                                                size="small"
                                                                label={createdDate.toLocaleDateString()} 
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {daysSinceCreation} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Last Modified
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="info" 
                                                                size="small"
                                                                label={modifiedDate.toLocaleDateString()} 
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {Math.floor((Date.now() - modifiedDate) / (1000 * 60 * 60 * 24))} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    
                                                    {objective.type && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                Type
                                                            </Typography>
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="secondary" 
                                                                size="small"
                                                                label={objective.type} 
                                                            />
                                                        </Grid>
                                                    )}
                                                    
                                                    {objective.description && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                Description
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {objective.description || "No description provided"}
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </AccordionDetails>
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