import { useQueries } from "@tanstack/react-query";
import { useState } from 'react';

// Import specific MUI components for better tree shaking
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';


export default function SaltPing(props) {
    const [isGrouped, setIsGrouped] = useState(true);

    const toggleView = () => {
        setIsGrouped(!isGrouped);
    };
    const options = {
        method: 'POST',
        headers: {
          'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
        }
      };
    const [saltpingresults] = useQueries({
        queries: [
          {
            queryKey: ["saltping"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/salt/ping",
                options
            ).then((res) => res.json()),
        }]});
    if (saltpingresults.isLoading) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <Box sx={{ display: 'flex' }}>
                <CircularProgress color="inherit"></CircularProgress>
            </Box>
            </>
    
        )
    }
    if (saltpingresults.error) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
                Failed to fetch Salt Ping data: {saltpingresults.error.message || "An unknown error occurred"}
            </Alert>
            </>
        )
    }
    if (saltpingresults.data) {
        // Check if results array is empty
        if (saltpingresults.data.length === 0) {
            return (
                <>
                    <Typography variant='h3'>{props.name}</Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No results were returned from the Salt Ping query.
                    </Alert>
                </>
            );
        }

        // Function to determine host group based on hostname
        const getHostGroup = (hostname) => {
            const name = hostname.replace('.buck.local', '').toLowerCase();

            if (name.includes('tiny')) return 'tiny';
            if (name.includes('vdi')) return 'vdi';
            if (name.includes('render')) return 'render';
            if (name.includes('gator')) return 'gator';
            if (name.includes('rent')) return 'rent';
            if (name.includes('gpu')) return 'gpu';
            if (name.includes('laxhq')) return 'laxhq';
            if (name.includes('lax') && !name.includes('laxhq')) return 'lax';

            // Default group for unmatched hosts
            return 'other';
        };

        // Group hosts by status and location
        const upHosts = saltpingresults.data.filter(item => item.up === "true");
        const downHosts = saltpingresults.data.filter(item => item.up !== "true");

        // Group by location for both up and down hosts
        const getGroupedHosts = (hosts) => {
            // Initialize groups
            const groups = {
                tiny: [],
                vdi: [],
                render: [],
                gator: [],
                rent: [],
                gpu: [],
                laxhq: [],
                lax: [],
                other: []
            };

            // Populate groups
            hosts.forEach(host => {
                const group = getHostGroup(host.host);
                groups[group].push(host);
            });

            return groups;
        };

        const upHostsByGroup = getGroupedHosts(upHosts);
        const downHostsByGroup = getGroupedHosts(downHosts);

        // Get all group names that have hosts
        const allGroups = [...new Set([
            ...Object.keys(upHostsByGroup).filter(group => upHostsByGroup[group].length > 0),
            ...Object.keys(downHostsByGroup).filter(group => downHostsByGroup[group].length > 0)
        ])];

        // Function to render hosts for a specific group
        const renderHostGroup = (hosts, status) => {
            if (hosts.length === 0) return null;

            const color = status === 'up' ? 'success' : 'error';

            return (
                <Grid container columns={16} rowSpacing={1} sx={{ mb: 2 }}>
                    {hosts.map((item) => (
                        <Grid item size={1} key={`${status}-${item.host}`}>
                            <Chip
                                color={color}
                                label={item.host.replace('.buck.local', '')}
                                sx={{ m: 0.5 }}
                            />
                        </Grid>
                    ))}
                </Grid>
            );
        };

        // Display results with count and grouping
        return (
            <>
            <Paper style={{height: 2500, overflow: 'auto', borer: "100px"}} variant="outlined">
                <Box sx={{ p: 2 }}>
                    <Typography variant='h3'>{props.name}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {saltpingresults.data.length} hosts returned ({upHosts.length} online, {downHosts.length} offline)
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={isGrouped ? <ViewListIcon /> : <ViewModuleIcon />}
                            onClick={toggleView}
                            size="small"
                        >
                            {isGrouped ? 'Show Ungrouped' : 'Show Grouped'}
                        </Button>
                    </Box>

                    {isGrouped ? (
                        /* Grouped View */
                        allGroups.map(group => (
                            <Box key={group} sx={{ mb: 4 }}>
                                <Typography variant="h5" sx={{ mt: 3, mb: 1, textTransform: 'capitalize' }}>
                                    {group} Hosts
                                </Typography>

                                {/* Online hosts in this group */}
                                {upHostsByGroup[group].length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'success.main', fontSize: '1rem' }}>
                                            Online ({upHostsByGroup[group].length})
                                        </Typography>
                                        {renderHostGroup(upHostsByGroup[group], 'up')}
                                    </>
                                )}

                                {/* Offline hosts in this group */}
                                {downHostsByGroup[group].length > 0 && (
                                    <>
                                        <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'error.main', fontSize: '1rem' }}>
                                            Offline ({downHostsByGroup[group].length})
                                        </Typography>
                                        {renderHostGroup(downHostsByGroup[group], 'down')}
                                    </>
                                )}
                            </Box>
                        ))
                    ) : (
                        /* Ungrouped View */
                        <>
                            {/* Online Hosts */}
                            <Typography variant="h6" sx={{ mt: 3, mb: 1, color: 'success.main' }}>
                                Online Hosts ({upHosts.length})
                            </Typography>
                            <Grid container columns={16} rowSpacing={2} sx={{ mb: 3 }}>
                                {upHosts.map((item) => (
                                    <Grid item size={1} key={`up-${item.host}`}>
                                        <Chip
                                            color="success"
                                            label={item.host.replace('.buck.local', '')}
                                            sx={{ m: 0.5 }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Offline Hosts */}
                            <Typography variant="h6" sx={{ mt: 3, mb: 1, color: 'error.main' }}>
                                Offline Hosts ({downHosts.length})
                            </Typography>
                            <Grid container columns={16} rowSpacing={2}>
                                {downHosts.map((item) => (
                                    <Grid item size={1} key={`down-${item.host}`}>
                                        <Chip
                                            color="error"
                                            label={item.host.replace('.buck.local', '')}
                                            sx={{ m: 0.5 }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    )}
                </Box>
            </Paper>
            </>
        )
    }

}

