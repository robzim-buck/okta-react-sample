import { 
  Chip, Typography, Box, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, LinearProgress
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloudIcon from '@mui/icons-material/Cloud';
import StorageIcon from '@mui/icons-material/Storage';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SpeedIcon from '@mui/icons-material/Speed';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';

export default function HammerSpaceDataPortals(props) {
    
    const [hammerspaceDataPortals] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceDataPortals"],
            queryFn: async () => {
                const response = await fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=data-portals", {
                    method: "GET",
                    headers: {
                        "x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch data portals: ${response.statusText}`);
                }
                return response.json();
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 2
        },
        ]
    });

    if (hammerspaceDataPortals.isLoading) {
        return (
            <Box>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    HammerSpace Data Portals
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    if (hammerspaceDataPortals.isError) {
        return (
            <Box>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    HammerSpace Data Portals
                </Typography>
                <Alert severity="error">
                    Error loading HammerSpace data portals: {hammerspaceDataPortals.error?.message || 'Unknown error'}
                </Alert>
            </Box>
        );
    }

    const portalsData = hammerspaceDataPortals.data || {};
    
    // Helper function to get portal status color and icon
    const getPortalStatus = (status, state) => {
        const statusCheck = status || state;
        if (!statusCheck) return { color: 'default', icon: <InfoIcon />, text: 'Unknown' };
        
        const statusLower = statusCheck.toLowerCase();
        if (statusLower.includes('active') || statusLower.includes('online') || statusLower.includes('running') || statusLower.includes('healthy')) {
            return { color: 'success', icon: <CheckCircleIcon />, text: 'Active' };
        }
        if (statusLower.includes('warning') || statusLower.includes('degraded') || statusLower.includes('partial')) {
            return { color: 'warning', icon: <WarningIcon />, text: 'Warning' };
        }
        if (statusLower.includes('error') || statusLower.includes('failed') || statusLower.includes('offline') || statusLower.includes('inactive')) {
            return { color: 'error', icon: <ErrorIcon />, text: 'Offline' };
        }
        return { color: 'info', icon: <InfoIcon />, text: statusCheck };
    };

    // Helper function to format data sizes
    const formatDataSize = (bytes) => {
        if (typeof bytes !== 'number') return bytes;
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper function to ensure valid label for Chip components
    const ensureValidLabel = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    };

    // Helper function to get appropriate icon for portal type
    const getPortalIcon = (type, name) => {
        const typeLower = (type || name || '').toLowerCase();
        if (typeLower.includes('nfs') || typeLower.includes('share')) return <StorageIcon />;
        if (typeLower.includes('smb') || typeLower.includes('cifs')) return <NetworkCheckIcon />;
        if (typeLower.includes('s3') || typeLower.includes('cloud')) return <CloudIcon />;
        if (typeLower.includes('performance') || typeLower.includes('speed')) return <SpeedIcon />;
        return <DashboardIcon />;
    };

    // Process portals data into displayable format
    const processPortalsData = (data) => {
        if (Array.isArray(data)) {
            return data.map((portal, index) => ({
                id: portal.id || portal.name || `portal_${index}`,
                name: portal.name || portal.portal_name || `Data Portal ${index + 1}`,
                ...portal
            }));
        } else if (typeof data === 'object') {
            return Object.entries(data).map(([key, value], index) => ({
                id: `${key}_${index}`,
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                ...value
            }));
        }
        return [];
    };

    const portals = processPortalsData(portalsData);

    return (
        <Box>
            <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                HammerSpace Data Portals ({portals.length} portals)
            </Typography>
            
            {portals.length === 0 ? (
                <Alert severity="info">
                    No data portals found.
                </Alert>
            ) : (
                <Grid container spacing={1}>
                    {portals.map((portal, index) => {
                        const portalId = portal.id || index;
                        const portalStatus = getPortalStatus(portal.status, portal.state);
                        
                        return (
                            <Grid item size={12} key={portalId}>
                                <Paper elevation={1} sx={{ p: 1.5, mb: 1 }}>
                                    {/* Header with name, status, and key metrics */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {getPortalIcon(portal.type, portal.name)}
                                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium', flexGrow: 1 }}>
                                            {portal.name}
                                        </Typography>
                                        <Chip 
                                            icon={portalStatus.icon}
                                            label={ensureValidLabel(portalStatus.text)} 
                                            color={portalStatus.color}
                                            size="small"
                                            variant="outlined"
                                        />
                                        {portal.type && (
                                            <Chip 
                                                label={ensureValidLabel(portal.type)}
                                                color="primary"
                                                size="small"
                                                variant="filled"
                                            />
                                        )}
                                    </Box>
                                    
                                    {/* Progress bar for usage if available */}
                                    {portal.usage_percent && (
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={portal.usage_percent} 
                                            color={
                                                portal.usage_percent < 70 ? 'success' : 
                                                portal.usage_percent < 90 ? 'warning' : 'error'
                                            }
                                            sx={{ height: 4, borderRadius: 2, mb: 1 }}
                                        />
                                    )}
                                    
                                    {/* Compact chips for key metrics */}
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                        {portal.mount_point && (
                                            <Chip 
                                                label={ensureValidLabel(`Mount: ${portal.mount_point}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {portal.capacity && (
                                            <Chip 
                                                label={ensureValidLabel(`Capacity: ${formatDataSize(portal.capacity)}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {portal.used_space && (
                                            <Chip 
                                                label={ensureValidLabel(`Used: ${formatDataSize(portal.used_space)}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {portal.connections !== undefined && (
                                            <Chip 
                                                label={ensureValidLabel(`Conn: ${portal.connections}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                        {portal.throughput && (
                                            <Chip 
                                                label={ensureValidLabel(`Throughput: ${portal.throughput}`)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontSize: '0.7rem', height: 20 }}
                                            />
                                        )}
                                    </Box>
                                    
                                    {/* Compact details table */}
                                    <TableContainer sx={{ maxHeight: 150 }}>
                                        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, fontSize: '0.75rem' } }}>
                                            <TableBody>
                                                {portal.description && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium', width: '20%' }}>Description</TableCell>
                                                        <TableCell>{portal.description}</TableCell>
                                                    </TableRow>
                                                )}
                                                {portal.endpoint && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Endpoint</TableCell>
                                                        <TableCell>{portal.endpoint}</TableCell>
                                                    </TableRow>
                                                )}
                                                {portal.protocol && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Protocol</TableCell>
                                                        <TableCell>{portal.protocol}</TableCell>
                                                    </TableRow>
                                                )}
                                                {portal.version && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Version</TableCell>
                                                        <TableCell>{portal.version}</TableCell>
                                                    </TableRow>
                                                )}
                                                {portal.last_accessed && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Last Accessed</TableCell>
                                                        <TableCell>{new Date(portal.last_accessed).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                )}
                                                {portal.created && (
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'medium' }}>Created</TableCell>
                                                        <TableCell>{new Date(portal.created).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                )}
                                                {/* Show remaining properties */}
                                                {Object.entries(portal)
                                                    .filter(([key]) => !['id', 'name', 'status', 'state', 'type', 'mount_point', 'capacity', 'used_space', 'connections', 'throughput', 'description', 'endpoint', 'protocol', 'version', 'last_accessed', 'created', 'usage_percent'].includes(key))
                                                    .map(([key, value]) => (
                                                        <TableRow key={key}>
                                                            <TableCell sx={{ fontWeight: 'medium' }}>
                                                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z_])/g, ' $1')}
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