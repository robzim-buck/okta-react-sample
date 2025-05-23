import uuid from 'react-uuid';
import { useState, useMemo } from 'react';
import axios from 'axios';
axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded';



import { useQueries } from "@tanstack/react-query";
import { Typography, Button, IconButton, Container } from '@mui/material';
import { Chip, Grid, Box, Card, CardContent, Collapse, Switch, FormControlLabel, Paper } from '@mui/material';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PieChartIcon from '@mui/icons-material/PieChart';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

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
    
    if (licenses.length > 0) {
        console.log('Raw licenses example:', JSON.stringify(licenses[0]));
    } else {
        console.log('Licenses array is empty');
    }
    
    const userMap = new Map();
    
    licenses.forEach((license, index) => {
        if (!license || !license.email) {
            console.error(`Invalid license object at index ${index}:`, license);
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
    console.log('Grouped users count:', result.length);
    if (result.length > 0) {
        console.log('First grouped user example:', JSON.stringify(result[0]));
    }
    return result;
}

const year = new Date().getFullYear().toString()
// console.log(year)
const endpoint = 'https://laxcoresrv.buck.local:8000';

// ProductBar component for visualizing product distribution
const ProductBar = ({ name, count, total, color }) => {
    // Skip rendering if count is 0
    if (count === 0) return null;
    
    const percentage = (count / total) * 100;
    
    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{name}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {count} ({percentage.toFixed(1)}%)
                </Typography>
            </Box>
            <Box sx={{ 
                width: '100%', 
                height: 12, 
                bgcolor: 'rgba(0, 0, 0, 0.05)', 
                borderRadius: 6, 
                overflow: 'hidden' 
            }}>
                <Box
                    sx={{
                        width: `${percentage}%`,
                        height: '100%',
                        bgcolor: color,
                        borderRadius: 6
                    }}
                />
            </Box>
        </Box>
    );
};

// LicenseStatusItem component for license status display
const LicenseStatusItem = ({ count, label, color }) => {
    return (
        <Stack alignItems="center" spacing={1}>
            <Box
                sx={{
                    position: 'relative',
                    width: 64,
                    height: 64,
                }}
            >
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={64}
                    thickness={4}
                    sx={{ color: 'rgba(0, 0, 0, 0.1)', position: 'absolute' }}
                />
                <CircularProgress
                    variant="determinate"
                    value={count > 0 ? 100 : 0}
                    size={64}
                    thickness={4}
                    sx={{ color, position: 'absolute' }}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {count}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
        </Stack>
    );
};

export default function ActiveSelfServLicenses(props) {
    console.log('ActiveSelfServLicenses component rendering');
    
    // Component state
    const [emailfilter, setEmailFilter] = useState('');
    const [productfilter, setProductFilter] = useState('');
    const [expandedUsers, setExpandedUsers] = useState({});
    const [tableView, setTableView] = useState(false);
    const [expandAll, setExpandAll] = useState(false);
    const [successvisible, setSuccessvisible] = useState(false);
    const [previsible, setPrevisible] = useState(false);
    const [operation, setOperation] = useState('');
    const [product, setProduct] = useState('');
    const [user, setUser] = useState('');
    
    // Fetch active licenses
    const licenseQuery = useQueries({
        queries: [
          {
            queryKey: ["activeLicenses"],
            queryFn: async () => {
              console.log('Fetching active licenses...');
              try {
                const response = await fetch("https://laxcoresrv.buck.local:8000/licenses/active_self_service_licenses", {
                  method: 'GET',
                  headers: {
                    'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
                  }
                });
                
                if (!response.ok) {
                  throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Received licenses data, type:', typeof data, 'isArray:', Array.isArray(data));
                if (data) {
                  console.log('Data sample:', Array.isArray(data) ? data.slice(0, 2) : data);
                }
                return data;
              } catch (error) {
                console.error("Error fetching license data:", error);
                throw error;
              }
            },
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 60000
          }
        ]
    });
    
    // For compatibility with existing code
    const activeLicenses = licenseQuery[0];

    const clearEmailFilter = () => {
        setEmailFilter('')
      }

    const clearProductFilter = () => {
        setProductFilter('')
      }

    // Alert components for license operations
    const PreviewAlert = () => {
        if (previsible) {
            return(
              <Snackbar sx={{minWidth: 400}} anchorOrigin={{vertical: 'top', horizontal: 'center'}} open={previsible} onClose={() => setPrevisible(false)} autoHideDuration={3000} >
                <Alert sx={{minWidth: 400}} action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setPrevisible(false)}}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                } severity="info">
                  <AlertTitle>Processing...</AlertTitle>
                  {operation} {product} License for {user}
                </Alert>
              </Snackbar>
            )
        }
        return null;
    }

    const SuccessAlert = () => {
        if (successvisible) {
            return(
              <Snackbar sx={{minWidth: 400}} anchorOrigin={{vertical: 'top', horizontal: 'center'}} open={successvisible} onClose={() => setSuccessvisible(false)} autoHideDuration={3000} >
                <Alert sx={{minWidth: 400}} action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setSuccessvisible(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                } icon={<CheckIcon fontSize="inherit" />} severity="success">
                  <AlertTitle>Success!</AlertTitle>
                  Successfully {operation} {product} for {user}!
                </Alert>
              </Snackbar>
            )
        }
        return null;
    }

    // Function to return a license
    function returnLicense(event, userEmail, licenseProduct) {
      if (!userEmail.includes('buck.co') && !userEmail.includes('anyways.co') && !userEmail.includes('giantant.ca')) {
        alert(`Only works for Buck, GiantAnt and Anyways Users, not for ${userEmail}`)
        return
      }
      setOperation('Returning');
      setPrevisible(true);
      setProduct(licenseProduct);
      setUser(userEmail);
      const url = `${endpoint}/licenses/release_self_service_license?product=${licenseProduct.toLowerCase()}&email=${userEmail}`;
      fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
        }
      }

      ).then(res => {
        setPrevisible(false);
        setSuccessvisible(true);

        // Refresh data after successful return
        setTimeout(() => {
          window.location.reload();
        }, 2000);

        return res.data;
      }).catch(error => {
        setPrevisible(false);
        alert(`Error returning license: ${error.message}`);
      });
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

    // Clean console logging for debugging
    console.log('ActiveSelfServLicenses render state:', { 
        isLoading: activeLicenses.isLoading,
        isError: activeLicenses.isError,
        data: activeLicenses.data ? 'exists' : 'missing',
        dataType: activeLicenses.data ? typeof activeLicenses.data : 'n/a',
        isArray: activeLicenses.data ? Array.isArray(activeLicenses.data) : 'n/a',
        dataLength: activeLicenses.data && Array.isArray(activeLicenses.data) ? activeLicenses.data.length : 0
    });

    // Loading state
    if (activeLicenses.isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
                    {props.name || 'Active Self Serve Licenses'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }
    
    // Error state
    if (activeLicenses.isError) {
        console.error('Error loading licenses:', activeLicenses.error);
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
                    {props.name || 'Active Self Serve Licenses'}
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                    <AlertTitle>Error Loading License Data</AlertTitle>
                    {activeLicenses.error?.message || 'An unexpected error occurred while loading license data.'}
                </Alert>
            </Container>
        );
    }
    
    // Ensure data is an array
    const licenseData = Array.isArray(activeLicenses.data) ? activeLicenses.data : 
                        activeLicenses.data ? (typeof activeLicenses.data === 'object' ? Object.values(activeLicenses.data) : []) : [];
    // Create simple test data for debugging - TEMPORARY
    const testData = [
        {
            email: "test@example.com",
            product: "adobe",
            timestamp: "2023-05-20T10:00:00",
            expiry: "2023-05-27T10:00:00"
        },
        {
            email: "another@example.com",
            product: "figma",
            timestamp: "2023-05-19T14:30:00",
            expiry: "2023-05-26T14:30:00"
        }
    ];
    
    // Process license data
    // Use either the real data or fallback to test data for debugging
    const dataToProcess = (activeLicenses.data && Array.isArray(activeLicenses.data) && activeLicenses.data.length > 0) 
        ? activeLicenses.data 
        : licenseData && licenseData.length > 0 ? licenseData : testData;
    
    console.log('Data to process:', {
        source: (activeLicenses.data && Array.isArray(activeLicenses.data)) ? 'API response' : 
                (licenseData && licenseData.length > 0) ? 'licenseData variable' : 'test data',
        length: dataToProcess.length,
        sample: dataToProcess.slice(0, 1)
    });
    
    // Memoize data processing to improve performance
    const processedData = useMemo(() => {
        console.log('Processing license data...', dataToProcess);
        let dataArray = dataToProcess;
        
        // Data is already validated as an array by this point
        
        // Validate each item has required fields
        const validData = dataArray.filter(item => 
            item && typeof item === 'object' && item.email && item.product && item.expiry
        );
        
        console.log('Valid data length:', validData.length);
        
        // Sort validated data
        const sortedData = validData.length > 0 
            ? validData.sort((a, b) => a.email.localeCompare(b.email))
            : [];
            
        return { sortedData, validData };
    }, [dataToProcess]);
        
        // If no data or invalid data, show empty state
        console.log('Processed data state:', {
            exists: !!processedData, 
            sortedData: processedData?.sortedData ? processedData.sortedData.length : 'none'
        });
        
        if (!processedData || !processedData.sortedData || processedData.sortedData.length === 0) {
            return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
                        {props.name || 'Active Self Serve Licenses'}
                    </Typography>
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle>No Licenses Found</AlertTitle>
                        No active self-service licenses were found in the system.
                    </Alert>
                </Container>
            );
        }
        
        // Memoize filtered data based on filters
        const { filteredData, extendedCount } = useMemo(() => {
            let filtered = processedData.sortedData;
            
            if (emailfilter.length > 0) {
                filtered = filtered.filter((f) => f.email.includes(emailfilter));
            }

            if (productfilter.length > 0) {
                filtered = filtered.filter((f) => f.product.includes(productfilter));
            }
            
            // Calculate extended licenses count
            const extended = processedData.sortedData.filter((x) => {
                try {
                    return setExtendedLabel(x.timestamp, x.expiry, x.product) === 'Extended';
                } catch (e) {
                    console.error('Error calculating extended label:', e);
                    return false;
                }
            }).length;
            
            return { filteredData: filtered, extendedCount: extended };
        }, [processedData.sortedData, emailfilter, productfilter]);
        
        const sortedData = processedData.sortedData;
        
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

        // Create a memoized flat array of all licenses for the data grid
        const allLicenses = useMemo(() => filteredData.map(license => {
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
        }).filter(Boolean), [filteredData]);

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
            {
                field: 'actions',
                headerName: 'Actions',
                flex: 0.8,
                sortable: false,
                renderCell: (params) => (
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => returnLicense(e, params.row.email, params.row.product)}
                    >
                        Return {params.row.product} for {params.row.email.split('@')[0]}
                    </Button>
                )
            },
        ];

        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant='h4' color="primary" fontWeight="medium" gutterBottom>
                    {props.name || 'Active Self Serve Licenses'}
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
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom>License Summary</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Total Licenses">
                                        <Chip 
                                            icon={<DashboardIcon fontSize="small" />}
                                            label={`${sortedData.length} Total`}
                                            color="primary"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Unique Users">
                                        <Chip 
                                            label={`${emailUniqueEntries(sortedData)} Users`}
                                            color="primary"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Tooltip>
                                    {extendedCount > 0 && (
                                        <Tooltip title="Extended Duration Licenses">
                                            <Chip 
                                                label={`${extendedCount} Extensions`}
                                                color="info"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                            
                            {/* Product Distribution Visualization */}
                            <Card sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                                    <PieChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Product Distribution
                                </Typography>
                                
                                {/* Visual Representation of License Distribution */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                                    {/* Adobe */}
                                    <ProductBar 
                                        name="Adobe" 
                                        count={productCount(sortedData, 'adobe')} 
                                        total={sortedData.length} 
                                        color="#FF0000" 
                                    />
                                    
                                    {/* Acrobat */}
                                    <ProductBar 
                                        name="Acrobat" 
                                        count={productCount(sortedData, 'acrobat')} 
                                        total={sortedData.length} 
                                        color="#FF5733" 
                                    />
                                    
                                    {/* Substance */}
                                    <ProductBar 
                                        name="Substance" 
                                        count={productCount(sortedData, 'substance')} 
                                        total={sortedData.length} 
                                        color="#C70039" 
                                    />
                                    
                                    {/* Figma */}
                                    <ProductBar 
                                        name="Figma" 
                                        count={productCount(sortedData, 'figma')} 
                                        total={sortedData.length} 
                                        color="#900C3F" 
                                    />
                                    
                                    {/* Figjam */}
                                    <ProductBar 
                                        name="Figjam" 
                                        count={productCount(sortedData, 'figjam')} 
                                        total={sortedData.length} 
                                        color="#581845" 
                                    />
                                    
                                    {/* Figma/Figjam */}
                                    <ProductBar 
                                        name="Figma/Figjam" 
                                        count={productCount(sortedData, 'figmafigjam')} 
                                        total={sortedData.length} 
                                        color="#800080" 
                                    />
                                    
                                    {/* MS Office 365 */}
                                    <ProductBar 
                                        name="MS Office 365" 
                                        count={productCount(sortedData, 'mso365')} 
                                        total={sortedData.length} 
                                        color="#0078D7" 
                                    />
                                </Box>
                                
                                {/* License Status Distribution */}
                                <Box sx={{ mt: 4 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                                        License Status
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                                        {/* Active Licenses */}
                                        <LicenseStatusItem 
                                            count={sortedData.filter(license => {
                                                const expiry = Date.parse(license.expiry);
                                                const timeToExpire = expiry - Date.now();
                                                return timeToExpire > (sixty_minutes * 2.0);
                                            }).length} 
                                            label="Active"
                                            color="success.main"
                                        />
                                        
                                        {/* Expiring Soon */}
                                        <LicenseStatusItem 
                                            count={sortedData.filter(license => {
                                                const expiry = Date.parse(license.expiry);
                                                const timeToExpire = expiry - Date.now();
                                                return timeToExpire <= (sixty_minutes * 2.0) && timeToExpire > 0;
                                            }).length} 
                                            label="Expiring Soon"
                                            color="warning.main"
                                        />
                                        
                                        {/* Expired */}
                                        <LicenseStatusItem 
                                            count={sortedData.filter(license => {
                                                const expiry = Date.parse(license.expiry);
                                                const timeToExpire = expiry - Date.now();
                                                return timeToExpire <= 0;
                                            }).length} 
                                            label="Expired"
                                            color="error.main"
                                        />
                                        
                                        {/* Extended */}
                                        <LicenseStatusItem 
                                            count={extendedCount}
                                            label="Extended"
                                            color="info.main"
                                        />
                                    </Box>
                                </Box>
                            </Card>
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
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    width: '100%'
                                                }}>
                                                    {/* Left section - User info */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '30%' }}>
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
                                                                flexShrink: 0,
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
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {user.email}
                                                        </Typography>
                                                    </Box>

                                                    {/* Middle section - Product info with progress bars */}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        flexGrow: 1,
                                                        px: 3,
                                                        maxWidth: '50%',
                                                        width: '100%'
                                                    }}>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
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

                                                        {/* Progress bars for each license */}
                                                        <Box sx={{ width: '100%' }}>
                                                            {user.licenses && user.licenses.map(license => {
                                                                const expiry = Date.parse(license.expiry);
                                                                const timeToExpire = expiry - Date.now();
                                                                const duration = Date.parse(license.expiry) - Date.parse(license.timestamp);
                                                                // Calculate percentage remaining (inverted so it decreases as time passes)
                                                                const percentRemaining = Math.max(0, Math.min(100, (timeToExpire / duration) * 100));

                                                                // Calculate hours remaining
                                                                const hoursRemaining = timeToExpire / (60 * 60 * 1000);

                                                                // Determine color based on time remaining
                                                                let progressColor = 'success.main';
                                                                if (hoursRemaining < 8) {
                                                                    if (hoursRemaining < 2) {
                                                                        progressColor = 'error.main'; // Red for <2 hours
                                                                    } else {
                                                                        progressColor = 'warning.main'; // Yellow/orange for <8 hours
                                                                    }
                                                                }

                                                                return (
                                                                    <Box key={license.email + license.product + license.timestamp} sx={{ mb: 1 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                            <Typography variant="caption" fontWeight="medium">
                                                                                {license.product}
                                                                            </Typography>
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                {hoursRemaining < 1
                                                                                    ? `${Math.round(hoursRemaining * 60)} mins remaining`
                                                                                    : hoursRemaining < 24
                                                                                        ? `${Math.round(hoursRemaining)} hours remaining`
                                                                                        : `${Math.round(hoursRemaining / 24)} days remaining`}
                                                                            </Typography>
                                                                        </Box>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={percentRemaining}
                                                                            sx={{
                                                                                height: 6,
                                                                                borderRadius: 3,
                                                                                bgcolor: 'rgba(0,0,0,0.05)',
                                                                                '& .MuiLinearProgress-bar': {
                                                                                    bgcolor: progressColor,
                                                                                }
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>

                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            {productCount} product{productCount !== 1 ? 's' : ''} • {licenseCount} license{licenseCount !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>

                                                    {/* Right section - Button */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '120px' }}>
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
                                                    </Box>
                                                </Box>

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

                                                                            <Grid item xs={12} sm={6} md={3}>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="error"
                                                                                    size="small"
                                                                                    startIcon={<DeleteIcon />}
                                                                                    onClick={(e) => {
                                                                                        returnLicense(e, item.email, item.product);
                                                                                    }}
                                                                                    sx={{ mt: 1 }}
                                                                                >
                                                                                    Return {item.product} for {item.email.split('@')[0]}
                                                                                </Button>
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

                {/* Display alerts */}
                <PreviewAlert />
                <SuccessAlert />
            </Container>
        )
    }
    
    // If we reach here without returning, we have an issue with data format
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" color="primary" fontWeight="medium" gutterBottom>
                {props.name || 'Active Self Serve Licenses'}
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
                <AlertTitle>No Data Available</AlertTitle>
                Unable to process license data. Please try refreshing the page.
            </Alert>
        </Container>
    )
