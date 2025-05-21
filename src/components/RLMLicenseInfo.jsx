import { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { 
  Typography, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Chip,
} from '@mui/material';

export default function RLMLicenseInfo() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["rlmLicenseInfo"],
    queryFn: () => 
      fetch("https://laxcoresrv.buck.local:8000/rlm/buck_rlm_license_info")
        .then((res) => res.json()),
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Parse product name and version from the product string
  const parseProductInfo = (productString) => {
    if (!productString) return { name: "Unknown", version: "" };
    
    const parts = productString.split(' v');
    if (parts.length >= 2) {
      return {
        name: parts[0],
        version: 'v' + parts[1]
      };
    }
    
    // For cases where there's no version or a different format
    return {
      name: productString,
      version: ""
    };
  };

  // Memoized license stats
  const licenseStats = useMemo(() => {
    if (!data) return { total: 0, used: 0, available: 0, products: {} };
    
    const stats = {
      total: 0,
      used: 0,
      available: 0,
      products: {}
    };
    
    data.forEach(license => {
      const count = parseInt(license.count || 0, 10);
      const used = parseInt(license.inuse || 0, 10);
      
      stats.total += count;
      stats.used += used;
      stats.available += (count - used);
      
      // Extract product name to group by
      const { name } = parseProductInfo(license.product);
      
      // Group by product
      if (!stats.products[name]) {
        stats.products[name] = {
          total: 0,
          used: 0,
          available: 0
        };
      }
      
      stats.products[name].total += count;
      stats.products[name].used += used;
      stats.products[name].available += (count - used);
    });
    
    return stats;
  }, [data]);

  // Grouped data for products with multiple versions
  const groupedByProduct = useMemo(() => {
    if (!data) return [];
    
    const grouped = {};
    
    data.forEach(license => {
      const { name } = parseProductInfo(license.product);
      
      if (!grouped[name]) {
        grouped[name] = {
          name,
          total: 0,
          used: 0,
          versions: []
        };
      }
      
      const count = parseInt(license.count || 0, 10);
      const used = parseInt(license.inuse || 0, 10);
      
      grouped[name].total += count;
      grouped[name].used += used;
      grouped[name].versions.push(license);
    });
    
    return Object.values(grouped);
  }, [data]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" color="primary" gutterBottom>
          RLM License Information
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#fff5f5' }}>
          <Typography color="error" variant="h6" gutterBottom>An error occurred</Typography>
          <Typography color="text.secondary">
            {error.message}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" color="primary" gutterBottom>
        RLM License Information
      </Typography>

      {/* License Summary Cards */}
      {/* <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item size={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Licenses
              </Typography>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {licenseStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="h6" color="info.dark" gutterBottom>
                In Use
              </Typography>
              <Typography variant="h3" sx={{ mb: 1, color: 'info.dark' }}>
                {licenseStats.used}
              </Typography>
              <Typography variant="body2" color="info.dark">
                {((licenseStats.used / licenseStats.total) * 100).toFixed(1)}% utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" color="success.dark" gutterBottom>
                Available
              </Typography>
              <Typography variant="h3" sx={{ mb: 1, color: 'success.dark' }}>
                {licenseStats.available}
              </Typography>
              <Typography variant="body2" color="success.dark">
                Ready for allocation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Products by Group */}
      <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 3 }}>
        Products Overview
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table sx={{ minWidth: 650 }} aria-label="RLM license product groups">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
              <TableCell>Product</TableCell>
              <TableCell>Total Licenses</TableCell>
              <TableCell>In Use</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Utilization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groupedByProduct
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((product, index) => {
                const available = product.total - product.used;
                const utilization = product.total > 0 ? (product.used / product.total) * 100 : 0;
                
                return (
                  <TableRow key={index} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.total}</TableCell>
                    <TableCell>{product.used}</TableCell>
                    <TableCell>{available}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            mr: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${utilization}%`,
                              borderRadius: 4,
                              bgcolor: utilization > 90 
                                ? 'error.main' 
                                : utilization > 70 
                                  ? 'warning.main' 
                                  : 'success.main',
                            }}
                          />
                        </Box>
                        <Typography variant="body2">
                          {utilization.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={groupedByProduct.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Detailed Product Usage */}
      <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 3 }}>
        Detailed License Information
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table sx={{ minWidth: 650 }} aria-label="RLM license table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
              <TableCell>Product</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Pool</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>In Use</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Utilization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data
              .map((license, index) => {
                const { name, version } = parseProductInfo(license.product);
                const used = parseInt(license.inuse || 0, 10);
                const count = parseInt(license.count || 0, 10);
                const available = count - used;
                const utilization = count > 0 ? (used / count) * 100 : 0;
                
                return (
                  <TableRow key={index} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {name}
                      </Typography>
                    </TableCell>
                    <TableCell>{version}</TableCell>
                    <TableCell>{license.host}</TableCell>
                    <TableCell>{license.pool}</TableCell>
                    <TableCell>{license.count}</TableCell>
                    <TableCell>{license.inuse}</TableCell>
                    <TableCell>{available}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            mr: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${utilization}%`,
                              borderRadius: 3,
                              bgcolor: utilization > 90 
                                ? 'error.main' 
                                : utilization > 70 
                                  ? 'warning.main' 
                                  : 'success.main',
                            }}
                          />
                        </Box>
                        <Typography variant="body2">
                          {utilization.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}