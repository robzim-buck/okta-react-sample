import { 
  Chip, Typography, Box, Container, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Tooltip, Card, LinearProgress
} from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function HammerSpaceSystemHealth(props) {
    
    const [hammerspaceSystemHealth] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceSystemHealth"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=/system/health", {
                    method: "GET",
                    
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch system health: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 2 * 60 * 1000, // 2 minutes for health data
            refetchOnWindowFocus: true,
            retry: 3
        },
        ]
    });

    if (hammerspaceSystemHealth.isLoading) {
        return (
            <Box>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    HammerSpace System Health
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    if (hammerspaceSystemHealth.isError) {
        return (
            <Box>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    HammerSpace System Health
                </Typography>
                <Alert severity="error">
                    Error loading HammerSpace system health: {hammerspaceSystemHealth.error?.message || 'Unknown error'}
                </Alert>
            </Box>
        );
    }

    const healthData = hammerspaceSystemHealth.data || {};
    
    // Helper function to get health status color and icon
    const getHealthStatus = (status, value, threshold) => {
        if (!status && value !== undefined && threshold !== undefined) {
            // Calculate status based on value and threshold
            if (value < threshold * 0.5) return { color: 'success', icon: <CheckCircleIcon />, text: 'Good' };
            if (value < threshold * 0.8) return { color: 'warning', icon: <WarningIcon />, text: 'Warning' };
            return { color: 'error', icon: <ErrorIcon />, text: 'Critical' };
        }
        
        if (!status) return { color: 'default', icon: <InfoIcon />, text: '' };
        
        const statusLower = status.toLowerCase();
        if (statusLower.includes('ok') || statusLower.includes('good') || statusLower.includes('healthy') || statusLower.includes('normal')) {
            return { color: 'success', icon: <CheckCircleIcon />, text: 'Healthy' };
        }
        if (statusLower.includes('warning') || statusLower.includes('degraded')) {
            return { color: 'warning', icon: <WarningIcon />, text: 'Warning' };
        }
        if (statusLower.includes('error') || statusLower.includes('critical') || statusLower.includes('failed')) {
            return { color: 'error', icon: <ErrorIcon />, text: 'Critical' };
        }
        return { color: 'info', icon: <InfoIcon />, text: status };
    };

    // Helper function to format percentage values
    const formatPercentage = (value) => {
        if (typeof value === 'number') {
            return `${value.toFixed(1)}%`;
        }
        return String(value || '');
    };

    // Helper function to ensure valid label for Chip components
    const ensureValidLabel = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    };

    // Helper function to get appropriate icon for metric type
    const getMetricIcon = (key) => {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('cpu') || keyLower.includes('processor')) return <SpeedIcon />;
        if (keyLower.includes('memory') || keyLower.includes('ram')) return <MemoryIcon />;
        if (keyLower.includes('disk') || keyLower.includes('storage')) return <StorageIcon />;
        if (keyLower.includes('network') || keyLower.includes('bandwidth')) return <NetworkCheckIcon />;
        return <HealthAndSafetyIcon />;
    };

    // Process health data into displayable format
    const processHealthData = (data) => {
        if (Array.isArray(data)) {
            return data.map((item, index) => ({
                id: item.id || `item_${index}`,
                name: item.name || item.component || `Health Check ${index + 1}`,
                ...item
            }));
        } else if (typeof data === 'object') {
            return Object.entries(data).map(([key, value], index) => ({
                id: `${key}_${index}`,
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                value: value,
                ...value
            }));
        }
        return [];
    };

    const healthItems = processHealthData(healthData);

    return (
        <Box>
            <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                HammerSpace System Health ({healthItems.length} components)
            </Typography>
            
            {healthItems.length === 0 ? (
                <Alert severity="info">
                    No system health data available.
                </Alert>
            ) : (
                <Grid container spacing={1}>
                    {healthItems.map((item, index) => {
                        const itemId = item.id || index;
                        const healthStatus = getHealthStatus(item.status, item.value, item.threshold);
                        
                        return (
                            <Grid item size={12} key={itemId}>
                                <Paper elevation={1} sx={{ p: 1.5, mb: 1 }}>
                                    {/* Header with name, status, and value */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {getMetricIcon(item.name)}
                                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium', flexGrow: 1 }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                    
                                    {/* Compact progress bar */}
                                    {typeof item.value === 'number' && item.value >= 0 && item.value <= 100 && (
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={item.value} 
                                            color={
                                                item.value < 50 ? 'success' : 
                                                item.value < 80 ? 'warning' : 'error'
                                            }
                                            sx={{ height: 4, borderRadius: 2, mb: 1 }}
                                        />
                                    )}
                                    
                                    {/* Compact chips for key metrics */}
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                        {item.lastCheck && (
                                            <Chip 
                                                label={ensureValidLabel(`Check: ${new Date(item.lastCheck).toLocaleTimeString()}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {item.uptime && (
                                            <Chip 
                                                label={ensureValidLabel(`Up: ${item.uptime}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {item.threshold && (
                                            <Chip 
                                                label={ensureValidLabel(`Thresh: ${formatPercentage(item.threshold)}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {item.responseTime && (
                                            <Chip 
                                                label={ensureValidLabel(`${item.responseTime}ms`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {item.availability && (
                                            <Chip 
                                                label={ensureValidLabel(`Avail: ${formatPercentage(item.availability)}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                    </Box>
                                    
                                    {/* Compact details in a single row table */}
                                    <TableContainer sx={{ maxHeight: 150 }}>
                                        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, fontSize: '0.75rem' } }}>
                                            <TableBody>
                                                {item.message && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium', width: '20%' }}>Message</TableCell>
                                                        <TableCell>{item.message}</TableCell>
                                                    </TableRow>
                                                )}
                                                {item.errorMessage && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium', color: 'error.main' }}>Error</TableCell>
                                                        <TableCell sx={{ color: 'error.main' }}>{item.errorMessage}</TableCell>
                                                    </TableRow>
                                                )}
                                                {item.description && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Description</TableCell>
                                                        <TableCell>{item.description}</TableCell>
                                                    </TableRow>
                                                )}
                                                {(item.currentValue !== undefined || item.expectedValue !== undefined) && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Values</TableCell>
                                                        <TableCell>
                                                            {item.currentValue !== undefined && `Current: ${formatPercentage(item.currentValue)}`}
                                                            {item.currentValue !== undefined && item.expectedValue !== undefined && ' | '}
                                                            {item.expectedValue !== undefined && `Expected: ${formatPercentage(item.expectedValue)}`}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {item.lastFailure && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium', color: 'warning.main' }}>Last Failure</TableCell>
                                                        <TableCell sx={{ color: 'warning.main' }}>{new Date(item.lastFailure).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                )}
                                                {item.recommendations && Array.isArray(item.recommendations) && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Recommendations</TableCell>
                                                        <TableCell>{item.recommendations.join('; ')}</TableCell>
                                                    </TableRow>
                                                )}
                                                {/* Show remaining properties in a compact format */}
                                                {Object.entries(item)
                                                    .filter(([key]) => !['id', 'name', 'status', 'value', 'message', 'lastCheck', 'uptime', 'threshold', 'responseTime', 'availability', 'errorMessage', 'description', 'currentValue', 'expectedValue', 'lastFailure', 'recommendations'].includes(key))
                                                    .map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {typeof value === 'object' ? 
                                                                    JSON.stringify(value).substring(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '') : 
                                                                    String(value)
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}