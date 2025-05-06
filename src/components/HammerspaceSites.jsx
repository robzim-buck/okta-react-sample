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

export default function HammerspaceSites(props) {
    const [expanded, setExpanded] = useState({});
    
    // Toggle expansion state for a specific site
    const handleToggle = (siteId) => {
        setExpanded(prev => ({
            ...prev,
            [siteId]: !prev[siteId]
        }));
    };
    
    const [hammerspaceSites] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceSites"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=sites",
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

    if (hammerspaceSites.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }
    
    if (hammerspaceSites.error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error" gutterBottom>An error has occurred</Typography>
                <Typography color="text.secondary">{hammerspaceSites.error.message}</Typography>
            </Box>
        );
    }
    
    if (hammerspaceSites.data) {
        const sortedData = hammerspaceSites.data.sort((a, b) => a.name.localeCompare(b.name));
        
        if (!sortedData || sortedData.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">No Hammerspace sites found</Typography>
                </Box>
            );
        }

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='h4' color="primary" fontWeight="medium">
                        {props.name || 'Hammerspace Sites'}
                    </Typography>
                    <Chip 
                        label={`${sortedData.length} Sites`} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>

                <Grid container spacing={3}>
                    {sortedData.map((site) => {
                        // Calculate time since creation and modification
                        const createdDate = new Date(site.created);
                        const modifiedDate = new Date(site.modified);
                        const daysSinceCreation = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
                        const daysSinceModification = Math.floor((Date.now() - modifiedDate) / (1000 * 60 * 60 * 24));
                        
                        // Determine status color
                        const getStatusColor = () => {
                            // Add logic to determine status based on site properties
                            // For this example, we'll just use a default color
                            return '#2196f3'; // blue
                        };
                        
                        return (
                            <Grid item xs={12} key={site.uoid?.uuid || uuid()}>
                                <Card 
                                    variant="outlined" 
                                    sx={{ 
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                        transition: 'all 0.2s ease-in-out',
                                        borderLeft: `4px solid ${getStatusColor()}`,
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 0 }}>
                                        <Accordion 
                                            expanded={expanded[site.name] || false}
                                            onChange={() => handleToggle(site.name)}
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
                                                            {expanded[site.name] ? 'Hide Details' : 'Show Details'}
                                                        </Button>
                                                    </Box>
                                                }
                                                sx={{ px: 3, py: 2 }}
                                            >
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} md={6}>
                                                        <Typography variant='h6'>
                                                            {site.name}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="info" 
                                                                size="small"
                                                                label={`ID: ${site.internalId}`} 
                                                            />
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="success" 
                                                                size="small"
                                                                label={daysSinceModification === 0 ? 'Updated today' : 
                                                                    daysSinceModification === 1 ? 'Updated yesterday' : 
                                                                    `Updated ${daysSinceModification} days ago`} 
                                                            />
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            
                                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Management Address
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                variant="filled" 
                                                                color="primary" 
                                                                size="small"
                                                                label={site.mgmtAddress || 'N/A'} 
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Data Address
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                variant="filled" 
                                                                color="primary" 
                                                                size="small"
                                                                label={site.dataAddress || 'N/A'} 
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Internal ID
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="secondary" 
                                                                size="small"
                                                                label={site.internalId || 'N/A'} 
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    
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
                                                                {daysSinceModification} days ago
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    
                                                    {site.type && (
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                                Type
                                                            </Typography>
                                                            <Chip 
                                                                variant="outlined" 
                                                                color="secondary" 
                                                                size="small"
                                                                label={site.type} 
                                                            />
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