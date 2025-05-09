import uuid from 'react-uuid';
import { useState, useMemo } from 'react';
import { useQueries } from "@tanstack/react-query";
import { Typography, Button, IconButton } from '@mui/material';
import { Chip, Grid, Box, Card, CardContent, Collapse, Switch, FormControlLabel } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid } from '@mui/x-data-grid';

const setColor = (param) => {
    if (param < sixty_minutes / 2.0) {
        return 'error'
    }
    if (param < (sixty_minutes * 2.0)) {
        return 'warning'
    }
    return 'success'
}


const sixty_minutes = 60 * 60 * 1000;
// const twenty_four_hours_plus_buffer = (24*60*60*1000) + 20000; // add 20 seconds

const four_days_plus_buffer = (24*60*60*1000*4) + 60000 * 60; // add 60 minutes
const six_days_plus_buffer = (24*60*60*1000*6) + 60000 * 60; // add 60 minutes
const seven_days_plus_buffer = (24*60*60*1000*7) + 60000 * 60; // add 60 minutes

const setExpiryLabel = (param) => {
    if (param < 0) {
        return 'Expired'
    }
    if (param < (sixty_minutes * 2.0)) {
        return 'Expiring'
    }
    if (param < sixty_minutes) {
        return `Expires in ${(param/sixty_minutes*100).toPrecision(2)} Minutes`
    }
    return 'Good'
}



const setDateColor = (param) => {
    let todaystring = new Date(Date.now()).toISOString().split('T')[0];
    let paramstring = new Date(param).toISOString().split('T')[0];
    // console.log(todaystring, paramstring)
    if ( paramstring === todaystring ) {
        return 'red'
    }
    return 'black'
}


const setChipLabel = (param) => {
    if (param < 0) {
        return 'Expired'
    }
    if (param < (sixty_minutes * 2.0)) {
        return 'Expiring'
    }
    return 'Active'
}



const setExtendedLabel = (issued, expiry, product) => {
    let issued_date = new Date(issued);
    let expiry_date = new Date(expiry);
    let diff = expiry_date - issued_date;
    // console.log(diff, four_days_plus_buffer)
    if (product === 'mso365') {
        if (diff > seven_days_plus_buffer) {
            return 'Extended'
        }
        return 'Active'
    }
    if (product === 'aquarium') {
        if (diff > six_days_plus_buffer) {
            return 'Extended'
        }
        return 'Active'
    }
    else {
        if (diff > four_days_plus_buffer) {
            return 'Extended'
        }
        return 'Active'
    }
}


const productCount = (list, product) => {
    let aCount = list.reduce((counter, list) => list.product === product ? ++counter : counter , 0);
    return aCount
}


const emailUniqueEntries = (list) => {
    let emailList = list.map(em => { return em.email });
    let emailSet = new Set(emailList)
    // console.log(item in emailSet)
    // let listForCounting = new Array(emailSet)
    let count = 0
    for (let a of emailSet.entries()) {
        a = 1
        count += a
    }
    // console.log(emailSet.entries().next())
    return count
}

const groupLicensesByUser = (licenses) => {
    // Check if licenses is an array
    if (!Array.isArray(licenses)) {
        console.error('Licenses is not an array:', licenses);
        return [];
    }
    
    console.log('Raw licenses data:', JSON.stringify(licenses[0]));
    
    const userMap = new Map();
    
    licenses.forEach(license => {
        if (!license || !license.email) {
            console.error('Invalid license object:', license);
            return;
        }
        
        if (!userMap.has(license.email)) {
            userMap.set(license.email, {
                email: license.email,
                products: [],
                licenses: []
            });
        }
        
        const user = userMap.get(license.email);
        user.licenses.push(license);
        
        if (!user.products.includes(license.product)) {
            user.products.push(license.product);
        }
    });
    
    const result = Array.from(userMap.values());
    console.log('First grouped user:', result.length > 0 ? JSON.stringify(result[0]) : 'No users');
    return result;
}

const year = new Date().getFullYear().toString()
// console.log(year)
export default function ActiveSelfServLicenses(props) {
    console.log('ActiveSelfServLicenses')
    const [emailfilter, setEmailFilter] = useState('');   
    const [productfilter, setProductFilter] = useState('');   
    const [expandedUsers, setExpandedUsers] = useState({});
    const [tableView, setTableView] = useState(false);
    const [expandAll, setExpandAll] = useState(false);
    
    const [activeLicenses] = useQueries({
        queries: [
          {
            queryKey: ["activeLicenses"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/self_service_license_info").then((res) => res.json()),
        },
        ]
    });

    const clearEmailFilter = () => {
        setEmailFilter('')
      }
    
    const clearProductFilter = () => {
        setProductFilter('')
      }
      
    const toggleUserExpand = (email) => {
        setExpandedUsers(prev => ({
            ...prev,
            [email]: !prev[email]
        }));
    }

    const toggleExpandAll = () => {
        const newExpandAll = !expandAll;
        setExpandAll(newExpandAll);
        
        // Switch to table view if expand all is enabled
        setTableView(newExpandAll);
        
        if (!newExpandAll) {
            // Collapse all users when switching back to card view
            setExpandedUsers({});
        }
    }

    if (activeLicenses.isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (activeLicenses.error) {
        return (
            <Box>
                <Typography variant="h4" color="primary" gutterBottom>
                    {props.name || 'Active Self Serve Licenses'}
                </Typography>
                <Paper sx={{ p: 3, bgcolor: '#fff5f5' }}>
                    <Typography color="error" variant="h6" gutterBottom>An error occurred</Typography>
                    <Typography color="text.secondary">
                        {activeLicenses.error.message}
                    </Typography>
                </Paper>
            </Box>
        );
    }
    if (activeLicenses.data) {
        console.log('Initial data:', typeof activeLicenses.data, Array.isArray(activeLicenses.data));
        console.log('Data sample:', JSON.stringify(activeLicenses.data).substring(0, 200));
        
        // Ensure we have a valid data structure
        let dataArray = [];
        
        if (Array.isArray(activeLicenses.data)) {
            dataArray = activeLicenses.data;
        } else if (typeof activeLicenses.data === 'object' && activeLicenses.data !== null) {
            // If data is an object but not an array, convert to array
            dataArray = Object.values(activeLicenses.data);
        } else if (typeof activeLicenses.data === 'string') {
            // If data is a string, try to parse as JSON
            try {
                const parsed = JSON.parse(activeLicenses.data);
                dataArray = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('Failed to parse data as JSON', e);
            }
        }
        
        console.log('Data array after processing:', dataArray.length);
        
        // Check if we have data to work with
        if (!dataArray || dataArray.length === 0) {
            return (
                <Box sx={{ margin: 2 }}>
                    <Typography variant='h5'>No {props.name} found</Typography>
                </Box>
            );
        }
        
        // Validate each item has required fields
        const validData = dataArray.filter(item => 
            item && typeof item === 'object' && item.email && item.product && item.expiry
        );
        
        console.log('Valid data items:', validData.length);
        
        // Sort validated data
        let sortedData = validData.length > 0 
            ? validData.sort((a, b) => a.email.localeCompare(b.email))
            : [];
            
        let filteredData = sortedData;
        var extendedCount = 0;
        
        if (emailfilter.length > 0) {
          filteredData = sortedData.filter((f) => f.email.includes(emailfilter));
        }

        if (productfilter.length > 0) {
            filteredData = sortedData.filter((f) => f.product.includes(productfilter));
        }
  
        extendedCount = sortedData.filter((x) => {
            try {
                return setExtendedLabel(x.timestamp, x.expiry, x.product) === 'Extended';
            } catch (e) {
                console.error('Error calculating extended label:', e);
                return false;
            }
        }).length;
        
        console.log('Filtered data ready:', filteredData.length);
        
        // Create a fallback direct grouping in case our main function fails
        const userGroups = {};
        
        // Simple grouping without the complex function
        filteredData.forEach(license => {
            if (!license.email) return;
            
            if (!userGroups[license.email]) {
                userGroups[license.email] = {
                    email: license.email,
                    products: [license.product],
                    licenses: [license]
                };
            } else {
                userGroups[license.email].licenses.push(license);
                if (!userGroups[license.email].products.includes(license.product)) {
                    userGroups[license.email].products.push(license.product);
                }
            }
        });
        
        // Convert to array for rendering
        const directGroupedUsers = Object.values(userGroups);
        console.log('Direct grouped users:', directGroupedUsers.length);
        
        // Use the direct grouping for now to ensure we see data
        const groupedUsers = directGroupedUsers;

        // Create a flat array of all licenses for the data grid
        const allLicenses = filteredData.map(license => {
            if (!license || !license.expiry) return null;
            
            let expiry = Date.parse(license.expiry);
            let timeToExpire = expiry - Date.now();
            let durationOfLicense = Date.parse(license.expiry) - Date.parse(license.timestamp);
            let durationString = durationOfLicense / (60 * 60 * 24 * 1000);
            
            const status = setChipLabel(timeToExpire);
            const isExtended = setExtendedLabel(license.timestamp, license.expiry, license.product) === 'Extended';
            
            return {
                id: license.email + '-' + license.product + '-' + license.timestamp,
                email: license.email,
                product: license.product,
                status: status,
                extended: isExtended ? 'Yes' : 'No',
                issuedDate: license.timestamp,
                expiryDate: license.expiry,
                duration: durationString.toFixed(2) + ' days',
                timeToExpire: timeToExpire,
                ...license
            };
        }).filter(Boolean);

        // Define columns for the DataGrid
        const columns = [
            { field: 'email', headerName: 'Email', flex: 1.5, sortable: true },
            { field: 'product', headerName: 'Product', flex: 1, sortable: true },
            { 
                field: 'status', 
                headerName: 'Status', 
                flex: 0.7, 
                sortable: true,
                renderCell: (params) => (
                    <Chip 
                        label={params.value} 
                        color={setColor(params.row.timeToExpire)}
                        variant="filled"
                        size="small"
                    />
                )
            },
            { 
                field: 'extended', 
                headerName: 'Extended', 
                flex: 0.7, 
                sortable: true,
                renderCell: (params) => (
                    params.value === 'Yes' ? 
                    <Chip label="Extended" color="info" size="small" /> : 
                    <Chip label="Standard" variant="outlined" size="small" />
                )
            },
            { 
                field: 'issuedDate', 
                headerName: 'Issued', 
                flex: 1, 
                sortable: true,
                valueFormatter: (params) => params.value ? params.value.replace(`${year}-`, "").replace('T', " ") : 'N/A',
                renderCell: (params) => (
                    <Typography variant="body2">
                        {params.value ? params.value.replace(`${year}-`, "").replace('T', " ") : 'N/A'}
                    </Typography>
                )
            },
            { 
                field: 'expiryDate', 
                headerName: 'Expires', 
                flex: 1, 
                sortable: true,
                valueFormatter: (params) => params.value ? params.value.replace(`${year}-`, "").replace('T', " ") : 'N/A',
                renderCell: (params) => (
                    <Typography variant="body2" color={setDateColor(params.value)}>
                        {params.value ? params.value.replace(`${year}-`, "").replace('T', " ") : 'N/A'}
                    </Typography>
                )
            },
            { field: 'duration', headerName: 'Duration', flex: 0.8, sortable: true },
        ];

        return (
            <Box>
                <Typography variant='h4' color="primary" gutterBottom>
                    {activeLicenses.data.length ? props.name : 'No ' + props.name}
                </Typography>
                
                <Card 
                    variant="outlined" 
                    sx={{ 
                        mb: 4, 
                        p: 2, 
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 2,
                        width: '100%'
                    }}
                >
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>License Summary</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Chip 
                                    label={`${productCount(sortedData, 'adobe')} Adobe`} 
                                    color="secondary" 
                                    variant="outlined" 
                                    size="small"
                                />
                                <Chip 
                                    label={`${productCount(sortedData, 'acrobat')} Acrobat`} 
                                    color="secondary" 
                                    variant="outlined"
                                    size="small" 
                                />
                                <Chip 
                                    label={`${productCount(sortedData, 'substance')} Substance`} 
                                    color="secondary" 
                                    variant="outlined"
                                    size="small" 
                                />
                                <Chip 
                                    label={`${productCount(sortedData, 'figma')} Figma`} 
                                    color="secondary" 
                                    variant="outlined"
                                    size="small" 
                                />
                                <Chip 
                                    label={`${productCount(sortedData, 'figjam')} Figjam`} 
                                    color="secondary" 
                                    variant="outlined"
                                    size="small" 
                                />
                                <Chip 
                                    label={`${productCount(sortedData, 'figmafigjam')} Figma/Figjam`} 
                                    color="secondary" 
                                    variant="outlined"
                                    size="small" 
                                />
                                <Chip 
                                    label={`${productCount(sortedData, 'mso365')} MS Office 365`} 
                                    color="secondary" 
                                    variant="outlined"
                                    size="small" 
                                />
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                    label={`${sortedData.length} Total Licenses`}
                                    color="primary"
                                    sx={{ fontWeight: 'bold' }}
                                />
                                <Chip 
                                    label={`${emailUniqueEntries(sortedData)} Users`}
                                    color="primary"
                                    sx={{ fontWeight: 'bold' }}
                                />
                                {extendedCount > 0 && (
                                    <Chip 
                                        label={`${extendedCount} Extensions`}
                                        color="info"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                )}
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Filters</Typography>
                                <Box>
                                    <Button
                                        variant="contained"
                                        color={expandAll ? "secondary" : "primary"}
                                        onClick={toggleExpandAll}
                                        sx={{ ml: 2 }}
                                    >
                                        {expandAll ? "Card View" : "Table View"}
                                    </Button>
                                </Box>
                            </Box>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                                            Email Filter:
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <input 
                                                id="emailfilter"
                                                name="emailfilter"
                                                type="text"
                                                value={emailfilter}
                                                placeholder="Filter by email address..."
                                                onChange={event => setEmailFilter(event.target.value)}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '8px 12px', 
                                                    border: '1px solid #ccc', 
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Box>
                                        <Button 
                                            onClick={clearEmailFilter} 
                                            size="small" 
                                            variant="outlined" 
                                            color="secondary"
                                            disabled={!emailfilter}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ minWidth: 120 }}>
                                            Product Filter:
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                            <input 
                                                id="productfilter"
                                                name="productfilter"
                                                type="text"
                                                value={productfilter}
                                                placeholder="Filter by product name..."
                                                onChange={event => setProductFilter(event.target.value)}
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '8px 12px', 
                                                    border: '1px solid #ccc', 
                                                    borderRadius: '4px' 
                                                }}
                                            />
                                        </Box>
                                        <Button 
                                            onClick={clearProductFilter} 
                                            size="small" 
                                            variant="outlined" 
                                            color="secondary"
                                            disabled={!productfilter}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>

                {/* Check if we have users */}
                {!groupedUsers || groupedUsers.length === 0 ? (
                    <Typography>No users found with the current filters</Typography>
                ) : (
                    <>
                        {/* User Summary - Only show if not in table view */}
                        {!tableView && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" color="primary">
                                    Found {groupedUsers.length} users with active licenses
                                </Typography>
                                <Chip 
                                    label={`${groupedUsers.length} Users`} 
                                    color="primary" 
                                    variant="outlined" 
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>
                        )}
                        
                        {/* Table View */}
                        {tableView ? (
                            <Box sx={{ width: '100%', height: 'auto', minHeight: 400 }}>
                                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                                    Showing all licenses in table format
                                </Typography>
                                <DataGrid
                                    rows={allLicenses}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 25,
                                            },
                                        },
                                        sorting: {
                                            sortModel: [{ field: 'email', sort: 'asc' }],
                                        },
                                    }}
                                    pageSizeOptions={[10, 25, 50, 100]}
                                    autoHeight
                                    disableRowSelectionOnClick
                                    density="standard"
                                    sx={{
                                        width: '100%',
                                        '& .MuiDataGrid-cell:focus': {
                                            outline: 'none',
                                        },
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        borderRadius: 2
                                    }}
                                />
                            </Box>
                        ) : (
                            // Card View
                            <>
                                {groupedUsers.map(user => {
                                    if (!user || !user.email) return null;
                                    
                                    const isExpanded = expandedUsers[user.email] || false;
                                    // Calculate license status for badge
                                    const hasExpiring = user.licenses.some(lic => {
                                        const expiry = Date.parse(lic.expiry);
                                        const timeToExpire = expiry - Date.now();
                                        return timeToExpire < (sixty_minutes * 2.0);
                                    });
                                    
                                    // Count products
                                    const productCount = user.products ? user.products.length : 0;
                                    const licenseCount = user.licenses ? user.licenses.length : 0;
                                    
                                    return (
                                        <Card 
                                            key={uuid()} 
                                            variant="outlined" 
                                            sx={{ 
                                                mb: 2, 
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                borderLeft: hasExpiring ? '4px solid #f44336' : '4px solid #4caf50',
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ py: 2 }}>
                                                <Grid container alignItems="center" spacing={2}>
                                                    <Grid item xs={12} md={5}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Box 
                                                                sx={{ 
                                                                    width: 40, 
                                                                    height: 40, 
                                                                    borderRadius: '50%', 
                                                                    bgcolor: 'primary.light', 
                                                                    display: 'flex', 
                                                                    justifyContent: 'center', 
                                                                    alignItems: 'center',
                                                                    mr: 2,
                                                                    color: 'white',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {user.email.charAt(0).toUpperCase()}
                                                            </Box>
                                                            <Typography 
                                                                variant="body1" 
                                                                sx={{ 
                                                                    fontWeight: 'medium',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                            >
                                                                {user.email}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} md={5}>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {user.products && user.products.map(product => (
                                                                <Chip 
                                                                    key={product} 
                                                                    label={product} 
                                                                    size="small" 
                                                                    variant="outlined"
                                                                    color="secondary"
                                                                />
                                                            ))}
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                            {productCount} product{productCount !== 1 ? 's' : ''} • {licenseCount} license{licenseCount !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                                        <Button 
                                                            aria-label={isExpanded ? 'Hide Details' : 'Show Details'}
                                                            size="small"
                                                            variant="contained"
                                                            color={isExpanded ? "secondary" : "primary"}
                                                            onClick={() => toggleUserExpand(user.email)}
                                                            sx={{ 
                                                                minWidth: 100,
                                                                borderRadius: 8
                                                            }}
                                                        >
                                                            {isExpanded ? 'Hide' : 'Show'}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                
                                                <Collapse in={isExpanded}>
                                                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                                                            License Details
                                                        </Typography>
                                                        
                                                        {user.licenses && user.licenses.map(item => {
                                                            if (!item || !item.expiry) {
                                                                return null;
                                                            }
                                                            
                                                            let expiry = Date.parse(item.expiry);
                                                            let timeToExpire = expiry - Date.now();
                                                            let durationOfLicense = Date.parse(item.expiry) - Date.parse(item.timestamp);
                                                            let durationString = durationOfLicense / (60 * 60 * 24 * 1000);
                                                            
                                                            // Status for color coding
                                                            const status = setChipLabel(timeToExpire);
                                                            const statusColor = setColor(timeToExpire);
                                                            const isExtended = setExtendedLabel(item.timestamp, item.expiry, item.product) === 'Extended';
                                                            
                                                            return (
                                                                <Card 
                                                                    key={uuid()} 
                                                                    variant="outlined" 
                                                                    sx={{ 
                                                                        mb: 2, 
                                                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                                                        borderColor: 'rgba(0,0,0,0.09)',
                                                                        position: 'relative',
                                                                        overflow: 'visible'
                                                                    }}
                                                                >
                                                                    <Box 
                                                                        sx={{ 
                                                                            position: 'absolute', 
                                                                            top: -10, 
                                                                            right: 16, 
                                                                            zIndex: 2 
                                                                        }}
                                                                    >
                                                                        <Chip 
                                                                            variant="filled" 
                                                                            size="small" 
                                                                            color={statusColor}
                                                                            label={status}
                                                                            sx={{ fontWeight: 'bold' }}
                                                                        />
                                                                        {isExtended && (
                                                                            <Chip 
                                                                                variant="filled" 
                                                                                size="small" 
                                                                                color="info"
                                                                                label="Extended"
                                                                                sx={{ ml: 1, fontWeight: 'bold' }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                    
                                                                    <CardContent sx={{ py: 2 }}>
                                                                        <Grid container spacing={2}>
                                                                            <Grid item xs={12} sm={6} md={3}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Product
                                                                                </Typography>
                                                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                                    {item.product}
                                                                                </Typography>
                                                                            </Grid>
                                                                            
                                                                            <Grid item xs={12} sm={6} md={3}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Issued
                                                                                </Typography>
                                                                                <Typography variant="body2" color={setDateColor(item.timestamp)}>
                                                                                    {item.timestamp ? item.timestamp.replace(`${year}-`, "").replace('T', " ") : 'N/A'}
                                                                                </Typography>
                                                                            </Grid>
                                                                            
                                                                            <Grid item xs={12} sm={6} md={3}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Expires
                                                                                </Typography>
                                                                                <Typography variant="body2" color={setDateColor(item.expiry)} sx={{ fontWeight: timeToExpire < sixty_minutes * 2 ? 'bold' : 'normal' }}>
                                                                                    {item.expiry ? item.expiry.replace(`${year}-`, "").replace('T', " ") : 'N/A'}
                                                                                </Typography>
                                                                            </Grid>
                                                                            
                                                                            <Grid item xs={12} sm={6} md={3}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    Duration
                                                                                </Typography>
                                                                                <Typography variant="body2">
                                                                                    {durationString.toFixed(2)} days
                                                                                </Typography>
                                                                            </Grid>
                                                                            
                                                                            <Grid item xs={12}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                                                    <Box sx={{ flex: 1, mr: 2 }}>
                                                                                        <LinearProgress 
                                                                                            color={statusColor} 
                                                                                            variant='determinate' 
                                                                                            value={Math.min(100, (100 - timeToExpire/sixty_minutes*100))}
                                                                                            sx={{ height: 8, borderRadius: 4 }}
                                                                                        />
                                                                                    </Box>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {setExpiryLabel(timeToExpire)}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
                                                    </Box>
                                                </Collapse>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}
            </Box>
        )
    }
}