import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function SaltCommand(props) {
    const [commandToExecute, setCommandToExecute] = useState('grains.items');
    const [hostName, setHostName] = useState('LAVDI01-VM01');
    const [siteName, setSiteName] = useState('lax');
    const [executeCommand, setExecuteCommand] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState('grains.items');

    const commonCommands = [
        'grains.items',
        'test.ping',
        'state.apply'
    ];

    const siteOptions = [
        'lax',
        'nyc',
        'syd',
        'ams'
    ];

    const handleCommandSelect = (event) => {
        const selectedCmd = event.target.value;
        setSelectedCommand(selectedCmd);
        setCommandToExecute(selectedCmd);
        setExecuteCommand(false);
    };

    const handleSiteSelect = (event) => {
        setSiteName(event.target.value);
        setExecuteCommand(false);
    };

    const handleHostSelect = (event) => {
        setHostName(event.target.value);
        setExecuteCommand(false);
    };

    const handleExecuteCommand = () => {
        setExecuteCommand(true);
    };

    // Fetch LDAP machine info for host dropdown
    const ldapMachineInfoQuery = useQuery({
        queryKey: ["ldap_machine_info"],
        queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buckldap_machineinfo", {
                headers: { 'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo' }
            }).then((res) => res.json()),
    });

    const saltCommandQueryUppercase = useQuery({
        queryKey: ["saltCommand", "uppercase", commandToExecute, hostName.toUpperCase(), siteName],
        queryFn: () => {
            const apiEndpoint = `https://laxcoresrv.buck.local:8000/salt/command_for_host_in_site/${commandToExecute}/${hostName.toUpperCase()}/${siteName}`;
            return fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
                }
            }).then((res) => res.json());
        },
        enabled: executeCommand
    });

    const saltCommandQueryLowercase = useQuery({
        queryKey: ["saltCommand", "lowercase", commandToExecute, hostName.toLowerCase(), siteName],
        queryFn: () => {
            const apiEndpoint = `https://laxcoresrv.buck.local:8000/salt/command_for_host_in_site/${commandToExecute}/${hostName.toLowerCase()}/${siteName}`;
            return fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
                }
            }).then((res) => res.json());
        },
        enabled: executeCommand
    });

    const renderCommandResult = (data) => {
        if (typeof data === 'object' && data !== null) {
            return (
                <Box sx={{ mt: 2 }}>
                    {Object.entries(data).map(([key, value]) => (
                        <Accordion key={key} sx={{ mb: 1 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{key}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                                    <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </pre>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            );
        } else {
            return (
                <Box sx={{ mt: 2, bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                    <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                        {String(data)}
                    </pre>
                </Box>
            );
        }
    };

    return (
        <Paper style={{ height: 'auto', overflow: 'auto', border: "1px solid #ccc" }} variant="outlined">
            <Box sx={{ p: 3 }}>
                <Typography variant='h3' sx={{ mb: 3 }}>{props.name}</Typography>
                
                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="command-select-label">Select Command</InputLabel>
                        <Select
                            labelId="command-select-label"
                            id="command-select"
                            value={selectedCommand}
                            label="Select Command"
                            onChange={handleCommandSelect}
                            variant="outlined"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: '#ffffff !important',
                                        '& .MuiMenuItem-root': {
                                            backgroundColor: '#ffffff !important',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5 !important'
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#f0f0f0 !important'
                                            }
                                        }
                                    }
                                }
                            }}
                            sx={{ 
                                backgroundColor: '#ffffff !important',
                                '& .MuiSelect-select': {
                                    backgroundColor: '#ffffff !important'
                                },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#ffffff !important'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            {commonCommands.map((command) => (
                                <MenuItem key={command} value={command}>
                                    {command}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField
                        fullWidth
                        label="Command"
                        value={commandToExecute}
                        onChange={(e) => {
                            setCommandToExecute(e.target.value);
                            setSelectedCommand(''); // Clear dropdown selection when manually typing
                            setExecuteCommand(false);
                        }}
                        sx={{ mb: 2 }}
                        placeholder="e.g., grains.items, cmd.run, test.ping"
                    />
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="host-select-label">Host</InputLabel>
                        <Select
                            labelId="host-select-label"
                            id="host-select"
                            value={hostName}
                            label="Host"
                            onChange={handleHostSelect}
                            variant="outlined"
                            disabled={ldapMachineInfoQuery.isLoading}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: '#ffffff !important',
                                        '& .MuiMenuItem-root': {
                                            backgroundColor: '#ffffff !important',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5 !important'
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#f0f0f0 !important'
                                            }
                                        }
                                    }
                                }
                            }}
                            sx={{ 
                                backgroundColor: '#ffffff !important',
                                '& .MuiSelect-select': {
                                    backgroundColor: '#ffffff !important'
                                },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#ffffff !important'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            {ldapMachineInfoQuery.data && ldapMachineInfoQuery.data
                                .filter(machine => machine.name) // Filter out machines without names
                                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
                                .map((machine) => (
                                    <MenuItem key={machine.name} value={machine.name}>
                                        {machine.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="site-select-label">Site</InputLabel>
                        <Select
                            labelId="site-select-label"
                            id="site-select"
                            value={siteName}
                            label="Site"
                            onChange={handleSiteSelect}
                            variant="outlined"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        backgroundColor: '#ffffff !important',
                                        '& .MuiMenuItem-root': {
                                            backgroundColor: '#ffffff !important',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5 !important'
                                            },
                                            '&.Mui-selected': {
                                                backgroundColor: '#f0f0f0 !important'
                                            }
                                        }
                                    }
                                }
                            }}
                            sx={{ 
                                backgroundColor: '#ffffff !important',
                                '& .MuiSelect-select': {
                                    backgroundColor: '#ffffff !important'
                                },
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#ffffff !important'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            {siteOptions.map((site) => (
                                <MenuItem key={site} value={site}>
                                    {site}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Button
                        variant="contained"
                        onClick={handleExecuteCommand}
                        disabled={(saltCommandQueryUppercase.isLoading || saltCommandQueryLowercase.isLoading) || !commandToExecute.trim() || !hostName.trim() || !siteName.trim()}
                        sx={{ mt: 1 }}
                    >
                        {(saltCommandQueryUppercase.isLoading || saltCommandQueryLowercase.isLoading) ? 'Executing...' : 'Execute Command'}
                    </Button>
                </Box>

                {(saltCommandQueryUppercase.isLoading || saltCommandQueryLowercase.isLoading) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 2 }} />
                        <Typography>Executing salt commands...</Typography>
                    </Box>
                )}

                {/* Uppercase Host Results */}
                {saltCommandQueryUppercase.data && !saltCommandQueryUppercase.isLoading && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Command Results for {hostName.toUpperCase()} in {siteName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Command: {commandToExecute} (Host: UPPERCASE)
                        </Typography>
                        {renderCommandResult(saltCommandQueryUppercase.data)}
                    </Box>
                )}

                {saltCommandQueryUppercase.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to execute salt command (UPPERCASE): {saltCommandQueryUppercase.error.message || "An unknown error occurred"}
                    </Alert>
                )}

                {/* Lowercase Host Results */}
                {saltCommandQueryLowercase.data && !saltCommandQueryLowercase.isLoading && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Command Results for {hostName.toLowerCase()} in {siteName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Command: {commandToExecute} (Host: lowercase)
                        </Typography>
                        {renderCommandResult(saltCommandQueryLowercase.data)}
                    </Box>
                )}

                {saltCommandQueryLowercase.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Failed to execute salt command (lowercase): {saltCommandQueryLowercase.error.message || "An unknown error occurred"}
                    </Alert>
                )}

                {executeCommand && !saltCommandQueryUppercase.data && !saltCommandQueryLowercase.data && !saltCommandQueryUppercase.isLoading && !saltCommandQueryLowercase.isLoading && !saltCommandQueryUppercase.error && !saltCommandQueryLowercase.error && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No results returned from either salt command.
                    </Alert>
                )}
            </Box>
        </Paper>
    );
}