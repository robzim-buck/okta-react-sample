import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Grid,
  TableSortLabel,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useProtectedApiGet } from '../hooks/useApi';
import Loading from './Loading';

const ProjectSizes = () => {
  const { data: projectSizesData, isLoading, error } = useProtectedApiGet('/utils/buck_sizes');
  const [orderBy, setOrderBy] = useState('size');
  const [order, setOrder] = useState('desc');
  const [expandedRawData, setExpandedRawData] = useState(new Set());
  const [expandedAllResults, setExpandedAllResults] = useState(new Set());

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleExpandRawData = (index) => {
    const newExpandedRawData = new Set(expandedRawData);
    if (newExpandedRawData.has(index)) {
      newExpandedRawData.delete(index);
    } else {
      newExpandedRawData.add(index);
    }
    setExpandedRawData(newExpandedRawData);
  };

  const handleExpandAllResults = (folderName) => {
    const newExpandedAllResults = new Set(expandedAllResults);
    if (newExpandedAllResults.has(folderName)) {
      newExpandedAllResults.delete(folderName);
    } else {
      newExpandedAllResults.add(folderName);
    }
    setExpandedAllResults(newExpandedAllResults);
  };

  const groupedAndSortedProjectSizes = useMemo(() => {
    if (!projectSizesData || !Array.isArray(projectSizesData)) return { latest: [], grouped: {} };
    
    // Group by folder
    const folderGroups = projectSizesData.reduce((groups, project) => {
      const folderName = project.folder;
      if (!groups[folderName]) {
        groups[folderName] = [];
      }
      groups[folderName].push({
        ...project,
        sizeMB: Math.round(project.size * 100) / 100,
        sizeGB: Math.round((project.size / 1024) * 100) / 100
      });
      return groups;
    }, {});

    // Get the latest result for each folder based on 'accessed' date
    const latestResults = Object.entries(folderGroups).map(([folderName, results]) => {
      const sortedByAccessed = results.sort((a, b) => {
        const aDate = a.accessed === '1969-12-31' ? new Date(0) : new Date(a.accessed);
        const bDate = b.accessed === '1969-12-31' ? new Date(0) : new Date(b.accessed);
        return bDate - aDate; // Most recent first
      });
      
      return {
        ...sortedByAccessed[0], // Latest result
        allResults: sortedByAccessed,
        resultCount: results.length
      };
    });

    // Sort the latest results based on current orderBy and order
    const sortedLatest = latestResults.sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle date sorting
      if (orderBy === 'lastUpdated' || orderBy === 'created' || orderBy === 'accessed') {
        aValue = aValue === '1969-12-31' ? new Date(0) : new Date(aValue);
        bValue = bValue === '1969-12-31' ? new Date(0) : new Date(bValue);
      }

      // Handle string sorting (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return { latest: sortedLatest, grouped: folderGroups };
  }, [projectSizesData, orderBy, order]);

  const formatDate = (dateString) => {
    if (dateString === '1969-12-31') return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const formatSize = (sizeInMB) => {
    if (sizeInMB >= 1024) {
      return `${Math.round((sizeInMB / 1024) * 100) / 100} GB`;
    }
    return `${Math.round(sizeInMB * 100) / 100} MB`;
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading project sizes: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Typography variant="h4" gutterBottom>
            Project Sizes
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Showing {groupedAndSortedProjectSizes.latest.length} unique folders (latest results only) from Hammerspace
          </Typography>
        </Grid>
        
        <Grid size={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>All Results</TableCell>
                  <TableCell>Raw Results</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'folder'}
                      direction={orderBy === 'folder' ? order : 'asc'}
                      onClick={() => handleRequestSort('folder')}
                    >
                      Folder
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'size'}
                      direction={orderBy === 'size' ? order : 'asc'}
                      onClick={() => handleRequestSort('size')}
                    >
                      Size
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'count'}
                      direction={orderBy === 'count' ? order : 'asc'}
                      onClick={() => handleRequestSort('count')}
                    >
                      File Count
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'host'}
                      direction={orderBy === 'host' ? order : 'asc'}
                      onClick={() => handleRequestSort('host')}
                    >
                      Host
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'lastUpdated'}
                      direction={orderBy === 'lastUpdated' ? order : 'asc'}
                      onClick={() => handleRequestSort('lastUpdated')}
                    >
                      Last Updated
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'created'}
                      direction={orderBy === 'created' ? order : 'asc'}
                      onClick={() => handleRequestSort('created')}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'accessed'}
                      direction={orderBy === 'accessed' ? order : 'asc'}
                      onClick={() => handleRequestSort('accessed')}
                    >
                      Last Accessed
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'google_drive_exists'}
                      direction={orderBy === 'google_drive_exists' ? order : 'asc'}
                      onClick={() => handleRequestSort('google_drive_exists')}
                    >
                      Google Drive
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupedAndSortedProjectSizes.latest.map((project, index) => (
                  <React.Fragment key={`${project.folder}-${index}`}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandAllResults(project.folder)}
                          aria-label={expandedAllResults.has(project.folder) ? 'collapse all results' : 'expand all results'}
                          title={`Show all ${project.resultCount} results for this folder`}
                        >
                          {expandedAllResults.has(project.folder) ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                        {project.resultCount > 1 && (
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            ({project.resultCount})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandRawData(index)}
                          aria-label={expandedRawData.has(index) ? 'collapse raw data' : 'expand raw data'}
                          title="Show raw JSON data"
                        >
                          {expandedRawData.has(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {project.folder}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatSize(project.size)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {project.count.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={project.host} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(project.lastUpdated)}</TableCell>
                      <TableCell>{formatDate(project.created)}</TableCell>
                      <TableCell>{formatDate(project.accessed)}</TableCell>
                      <TableCell>
                        {project.google_drive_exists === null ? (
                          <Chip label="Unknown" size="small" color="default" />
                        ) : project.google_drive_exists ? (
                          <Chip label="Yes" size="small" color="success" />
                        ) : (
                          <Chip label="No" size="small" color="error" />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Raw Data Expansion */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                        <Collapse in={expandedRawData.has(index)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Raw Data (Latest Result)
                            </Typography>
                            <Paper
                              sx={{
                                p: 2,
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                borderRadius: 1
                              }}
                            >
                              <Typography
                                component="pre"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                  margin: 0
                                }}
                              >
                                {JSON.stringify(project, null, 2)}
                              </Typography>
                            </Paper>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>

                    {/* All Results Expansion */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                        <Collapse in={expandedAllResults.has(project.folder)} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              All Results for {project.folder} ({project.resultCount} total)
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Size</TableCell>
                                    <TableCell>File Count</TableCell>
                                    <TableCell>Host</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Last Accessed</TableCell>
                                    <TableCell>Google Drive</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {project.allResults.map((result, resultIndex) => (
                                    <TableRow key={`${project.folder}-result-${resultIndex}`}>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {formatSize(result.size)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>{result.count.toLocaleString()}</TableCell>
                                      <TableCell>
                                        <Chip 
                                          label={result.host} 
                                          size="small" 
                                          color="primary"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell>{formatDate(result.lastUpdated)}</TableCell>
                                      <TableCell>{formatDate(result.created)}</TableCell>
                                      <TableCell>{formatDate(result.accessed)}</TableCell>
                                      <TableCell>
                                        {result.google_drive_exists === null ? (
                                          <Chip label="Unknown" size="small" color="default" />
                                        ) : result.google_drive_exists ? (
                                          <Chip label="Yes" size="small" color="success" />
                                        ) : (
                                          <Chip label="No" size="small" color="error" />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectSizes;