import { useState, useMemo } from 'react';
import { 
    Typography, 
    Button, 
    Container, 
    Card, 
    CardContent, 
    Grid, 
    Box,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewListIcon from '@mui/icons-material/ViewList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useProtectedApiGet } from '../hooks/useApi';

const PTOCalendar = () => {
    const [cardView, setCardView] = useState(true);
    const [hidePastDates, setHidePastDates] = useState(false);
    const [sortField, setSortField] = useState('Employee Name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Get end of current month as default end date
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const endOfMonthString = endOfMonth.toISOString().split('T')[0];
    
    const [startDate, setStartDate] = useState(todayString);
    const [endDate, setEndDate] = useState(endOfMonthString);
    
    // Separate state for the actual API query dates
    const [queryStartDate, setQueryStartDate] = useState(todayString);
    const [queryEndDate, setQueryEndDate] = useState(endOfMonthString);

    const { data: ptoData, isLoading, error } = useProtectedApiGet(
        '/deltek/deltek_databoard',
        {
            queryParams: { 
                id: '10048',
                start_date: queryStartDate,
                end_date: queryEndDate
            },
            queryConfig: {
                staleTime: 300000, // 5 minutes
                refetchOnWindowFocus: false
            },
            dependencies: [queryStartDate, queryEndDate] // Re-fetch when query dates change
        }
    );

    // Helper function to get field value with multiple possible field names
    const getFieldValue = (entry, possibleFields) => {
        for (const field of possibleFields) {
            if (entry[field] !== undefined && entry[field] !== null && entry[field] !== '') {
                return entry[field];
            }
        }
        return null;
    };

    // Helper functions for specific fields based on actual API response
    const getEmployeeName = (entry) => {
        return getFieldValue(entry, [
            'Employee Name', 'employee_name', 'employeeName', 'name', 'employee'
        ]);
    };

    const getStartDate = (entry) => {
        return getFieldValue(entry, [
            'Start Date', 'start_date', 'startDate', 'start'
        ]);
    };

    const getEndDate = (entry) => {
        return getFieldValue(entry, [
            'End Date', 'end_date', 'endDate', 'end'
        ]);
    };

    const getDuration = (entry) => {
        // Calculate duration from Hours field or start/end dates
        const hours = getFieldValue(entry, ['Hours', 'hours']);
        if (hours) {
            return (hours / 8).toFixed(1); // Convert hours to days (assuming 8-hour workday)
        }
        
        // If no hours, try to calculate from dates
        const startDate = getStartDate(entry);
        const endDate = getEndDate(entry);
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            return diffDays;
        }
        
        return null;
    };

    const getDepartment = (entry) => {
        return getFieldValue(entry, [
            'Department', 'department', 'dept'
        ]);
    };

    const getLocation = (entry) => {
        return getFieldValue(entry, [
            'User Location', 'location', 'office', 'site'
        ]);
    };

    const getEmployeeId = (entry) => {
        return getFieldValue(entry, [
            'Employee ID', 'employeeId', 'employee_id', 'id'
        ]);
    };

    const getUsername = (entry) => {
        return getFieldValue(entry, [
            'Username', 'username', 'email'
        ]);
    };

    const sortEntries = (entries) => {
        if (!entries || entries.length === 0) return entries;

        return [...entries].sort((a, b) => {
            let aValue, bValue;

            switch (sortField) {
                case 'Employee Name':
                    aValue = getEmployeeName(a) || '';
                    bValue = getEmployeeName(b) || '';
                    break;
                case 'Department':
                    aValue = getDepartment(a) || '';
                    bValue = getDepartment(b) || '';
                    break;
                case 'Location':
                    aValue = getLocation(a) || '';
                    bValue = getLocation(b) || '';
                    break;
                case 'Start Date':
                    aValue = getStartDate(a) ? new Date(getStartDate(a)) : new Date(0);
                    bValue = getStartDate(b) ? new Date(getStartDate(b)) : new Date(0);
                    break;
                case 'End Date':
                    aValue = getEndDate(a) ? new Date(getEndDate(a)) : new Date(0);
                    bValue = getEndDate(b) ? new Date(getEndDate(b)) : new Date(0);
                    break;
                case 'Duration':
                    aValue = getDuration(a) || 0;
                    bValue = getDuration(b) || 0;
                    break;
                case 'Hours':
                    aValue = getFieldValue(a, ['Hours', 'hours']) || 0;
                    bValue = getFieldValue(b, ['Hours', 'hours']) || 0;
                    break;
                case 'Email':
                    aValue = getUsername(a) || '';
                    bValue = getUsername(b) || '';
                    break;
                default:
                    aValue = getEmployeeName(a) || '';
                    bValue = getEmployeeName(b) || '';
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === 'asc' ? comparison : -comparison;
            } else {
                const comparison = aValue - bValue;
                return sortDirection === 'asc' ? comparison : -comparison;
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    };

    // Process data into array format for hooks
    const ptoEntries = useMemo(() => {
        if (!ptoData) return [];
        
        let entries = [];
        if (Array.isArray(ptoData)) {
            entries = ptoData;
        } else if (typeof ptoData === 'object') {
            // Check if it's a single object or has nested data
            if (ptoData.data && Array.isArray(ptoData.data)) {
                entries = ptoData.data;
            } else if (ptoData.results && Array.isArray(ptoData.results)) {
                entries = ptoData.results;
            } else {
                // Single object, wrap in array
                entries = [ptoData];
            }
        }
        
        // Filter out entries with 'System.String' values
        return entries.filter(entry => {
            if (!entry || typeof entry !== 'object') return false;
            
            // Check if any field contains 'System.String'
            const hasSystemString = Object.values(entry).some(value => 
                value === 'System.String' || 
                (typeof value === 'string' && value.includes('System.String'))
            );
            
            return !hasSystemString;
        });
    }, [ptoData]);

    // Get unique departments and locations for dropdowns
    const uniqueDepartments = useMemo(() => {
        const departments = ptoEntries
            .map(entry => getDepartment(entry))
            .filter(dept => dept && dept.trim() !== '')
            .filter((dept, index, arr) => arr.indexOf(dept) === index)
            .sort();
        return departments;
    }, [ptoEntries]);

    const uniqueLocations = useMemo(() => {
        const locations = ptoEntries
            .map(entry => getLocation(entry))
            .filter(loc => loc && loc.trim() !== '')
            .filter((loc, index, arr) => arr.indexOf(loc) === index)
            .sort();
        return locations;
    }, [ptoEntries]);

    // Filter entries based on all filters
    const filteredEntries = useMemo(() => {
        let filtered = ptoEntries;

        // Date filter
        if (hidePastDates) {
            filtered = filtered.filter(entry => {
                const endDate = getEndDate(entry);
                if (!endDate) return true; // Keep entries without end dates
                const entryEndDate = new Date(endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time to start of day
                return entryEndDate >= today;
            });
        }

        // Department filter
        if (selectedDepartment) {
            filtered = filtered.filter(entry => {
                const department = getDepartment(entry);
                return department === selectedDepartment;
            });
        }

        // Location filter
        if (selectedLocation) {
            filtered = filtered.filter(entry => {
                const location = getLocation(entry);
                return location === selectedLocation;
            });
        }

        return filtered;
    }, [ptoEntries, hidePastDates, selectedDepartment, selectedLocation]);

    // Apply sorting to filtered entries
    const sortedEntries = useMemo(() => {
        return sortEntries(filteredEntries);
    }, [filteredEntries, sortField, sortDirection]);

    // Debug logging to see the actual data structure
    console.log('PTO Data received:', ptoData);
    console.log('PTO Data type:', typeof ptoData);
    console.log('PTO Data is array:', Array.isArray(ptoData));
    if (ptoData && Array.isArray(ptoData) && ptoData.length > 0) {
        console.log('First PTO entry:', ptoData[0]);
        console.log('Field names:', Object.keys(ptoData[0]));
    }

    const toggleView = () => {
        setCardView(!cardView);
    };

    const handleRefresh = () => {
        setQueryStartDate(startDate);
        setQueryEndDate(endDate);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };



    console.log('Processed PTO entries:', ptoEntries);
    console.log('Number of entries:', ptoEntries.length);
    console.log('Filtered entries:', filteredEntries.length);

    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Error loading PTO data: {error.message}</Typography>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" color="primary" fontWeight="medium">
                    PTO Calendar
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={hidePastDates}
                                onChange={(e) => setHidePastDates(e.target.checked)}
                                color="secondary"
                            />
                        }
                        label="Hide Past Dates"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={cardView}
                                onChange={toggleView}
                                color="primary"
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {cardView ? <CalendarTodayIcon /> : <ViewListIcon />}
                                {cardView ? 'Card View (Click for Table View)' : 'Table View (Click for Card View)'}
                            </Box>
                        }
                    />
                </Box>
            </Box>

            {/* Filters */}
            <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Filters
                    </Typography>
                    {(startDate !== queryStartDate || endDate !== queryEndDate) && (
                        <Typography variant="body2" color="warning.main" sx={{ fontStyle: 'italic' }}>
                            Click "Refresh" to apply date changes
                        </Typography>
                    )}
                    {(startDate === queryStartDate && endDate === queryEndDate) && (
                        <Typography variant="body2" color="success.main" sx={{ fontStyle: 'italic' }}>
                            Showing: {queryStartDate} to {queryEndDate}
                        </Typography>
                    )}
                </Box>
                <Grid container spacing={2} alignItems="center">
                    <Grid item size={4}>
                        <TextField
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            fullWidth
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item size={4}>
                        <TextField
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            fullWidth
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                }
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item size={4}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                    setStartDate(todayString);
                                    setEndDate(endOfMonthString);
                                    setQueryStartDate(todayString);
                                    setQueryEndDate(endOfMonthString);
                                }}
                            >
                                This Month
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => {
                                    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                                    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
                                    const nextMonthString = nextMonth.toISOString().split('T')[0];
                                    const endOfNextMonthString = endOfNextMonth.toISOString().split('T')[0];
                                    setStartDate(nextMonthString);
                                    setEndDate(endOfNextMonthString);
                                    setQueryStartDate(nextMonthString);
                                    setQueryEndDate(endOfNextMonthString);
                                }}
                            >
                                Next Month
                            </Button>
                            <Button 
                                variant="contained" 
                                size="small"
                                color="primary"
                                onClick={handleRefresh}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Refresh'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
                
                {/* Department and Location Filters */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Filter by Department & Location
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item size={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="department-filter-label">Department</InputLabel>
                                <Select
                                    labelId="department-filter-label"
                                    value={selectedDepartment}
                                    label="Department"
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    sx={{ 
                                        backgroundColor: '#ffffff',
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#ffffff'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'divider'
                                        },
                                        '& .MuiSelect-select': {
                                            backgroundColor: '#ffffff'
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#ffffff',
                                                boxShadow: 3,
                                                border: '1px solid #e0e0e0'
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>All Departments</em>
                                    </MenuItem>
                                    {uniqueDepartments.map((department) => (
                                        <MenuItem key={department} value={department}>
                                            {department}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item size={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="location-filter-label">Location</InputLabel>
                                <Select
                                    labelId="location-filter-label"
                                    value={selectedLocation}
                                    label="Location"
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    sx={{ 
                                        backgroundColor: '#ffffff',
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#ffffff'
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'divider'
                                        },
                                        '& .MuiSelect-select': {
                                            backgroundColor: '#ffffff'
                                        }
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: '#ffffff',
                                                boxShadow: 3,
                                                border: '1px solid #e0e0e0'
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>All Locations</em>
                                    </MenuItem>
                                    {uniqueLocations.map((location) => (
                                        <MenuItem key={location} value={location}>
                                            {location}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {sortedEntries.length === 0 && ptoEntries.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No PTO data available
                    </Typography>
                    {ptoData && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Debug: Raw data received
                            </Typography>
                            <Typography variant="caption" component="pre" sx={{ display: 'block', mt: 1, textAlign: 'left' }}>
                                {JSON.stringify(ptoData, null, 2)}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {sortedEntries.length === 0 && ptoEntries.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No PTO entries found for the current filter
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {hidePastDates ? 'All entries are in the past. Toggle "Hide Past Dates" to see them.' : ''}
                    </Typography>
                </Box>
            )}

            {ptoEntries.length > 0 && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.dark" gutterBottom>
                        Debug Info: Found {ptoEntries.length} total entries, showing {sortedEntries.length} entries
                    </Typography>
                    {ptoEntries[0] && (
                        <Typography variant="caption" component="pre" sx={{ display: 'block', mt: 1 }}>
                            Available fields: {Object.keys(ptoEntries[0]).join(', ')}
                        </Typography>
                    )}
                </Box>
            )}

            {cardView ? (
                // Card View
                <Grid container spacing={3}>
                    {sortedEntries.map((entry, index) => (
                        <Grid item size={4} key={index}>
                            <Card 
                                variant="outlined"
                                sx={{
                                    height: '100%',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" color="primary">
                                                {getEmployeeName(entry) || 'Unknown Employee'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {getDepartment(entry)} • {getLocation(entry)}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label="PTO" 
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Start Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(getStartDate(entry)) || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            End Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(getEndDate(entry)) || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Duration
                                        </Typography>
                                        <Typography variant="body1">
                                            {getDuration(entry) ? `${getDuration(entry)} days` : 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Hours
                                        </Typography>
                                        <Typography variant="body1">
                                            {getFieldValue(entry, ['Hours', 'hours']) || 'N/A'} hours
                                        </Typography>
                                    </Box>

                                    {getUsername(entry) && (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Email
                                            </Typography>
                                            <Typography variant="body2">
                                                {getUsername(entry)}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                // Table View
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: 'primary.main' }}>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Employee Name')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Employee
                                        {sortField === 'Employee Name' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Department')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Department
                                        {sortField === 'Department' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Location')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Location
                                        {sortField === 'Location' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Start Date')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Start Date
                                        {sortField === 'Start Date' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('End Date')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        End Date
                                        {sortField === 'End Date' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Duration')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Duration
                                        {sortField === 'Duration' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Hours')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Hours
                                        {sortField === 'Hours' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { backgroundColor: 'primary.dark' }
                                    }}
                                    onClick={() => handleSort('Email')}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        Email
                                        {sortField === 'Email' && (
                                            sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedEntries.map((entry, index) => (
                                <TableRow 
                                    key={index} 
                                    sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {getEmployeeName(entry) || 'Unknown'}
                                    </TableCell>
                                    <TableCell>
                                        {getDepartment(entry) || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {getLocation(entry) || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(getStartDate(entry)) || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(getEndDate(entry)) || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {getDuration(entry) ? `${getDuration(entry)} days` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {getFieldValue(entry, ['Hours', 'hours']) || 'N/A'} hours
                                    </TableCell>
                                    <TableCell>
                                        {getUsername(entry) || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default PTOCalendar;