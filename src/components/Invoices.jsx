import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState, Component } from 'react';
import { Typography, Button, Chip, Select, MenuItem } from '@mui/material';
import { Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material'
import uuid from 'react-uuid';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker, LocalizationProvider }  from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      console.log(error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        alert("Something went Wrong !!!")
        return <h1>Something went wrong.</h1>;
      }
  
      return this.props.children; 
    }
  }


export default function Invoices(props) {
    let today = new Date();

    let todayString = dayjs(today.toISOString());

    console.log('today string = ', todayString);
    // const [valueString, setValueString] = useState(todayString.format('YYYY-MM-DD'))
    const [valueString, setValueString] = useState('')
    const [invoices, setInvoices] = useState('');
    const [jobfilter, setJobfilter] = useState('');
    // const [datefilter, setDatefilter] = useState('');
    const [table, setTable] = useState('PRODUCTION');

    const [datePickerValue, setDatePickerValue] = useState(dayjs(''));

    const handleTableChange = (event) => {
        setTable(event.target.value);
    };



        useEffect(() => {
            axios.get(`https://laxcoresrv.buck.local:8000/invoice_info?_system=${table}`).then(function(response) {
                console.log(response.status)
                    let resData = response.data;
                    console.log(`fetched ${resData.length} invoices`)
                    setInvoices(resData)
                }).catch(function(error) {
                console.log(error)
            }).finally( () =>  {
                console.log('finally!')
            } )
        }, [table])
    

    if (invoices) {

        let filteredData = invoices;


        const clearJobFilter = () => {
            setJobfilter('')
        }


        const clearDateFilter = () => {
            setValueString('')
            setDatePickerValue(dayjs(''))
        }


        if (jobfilter.length > 0) {
          filteredData = invoices.filter((f) => f.jobcode.includes(jobfilter.toUpperCase()));
        }

        if (valueString.length > 0) {
            // console.log(valueString);
            filteredData = invoices.filter((f) => f.triggerdate.includes(valueString));
        }

        return (
            <>
            <ErrorBoundary>
            <Typography variant='h4' gutterBottom>{table} {props.name} </Typography>
            <Select
                labelId="invoice-table-select-id"
                id="table-select"
                value={table}
                label="System"
                onChange={handleTableChange}
                MenuProps={{
                  PaperProps: {
                    style: {
                      backgroundColor: 'white',
                      color: 'black'
                    }
                  }
                }}>
            <MenuItem value='SANDBOX'>Sandbox</MenuItem>
            <MenuItem value='PRODUCTION'>Production</MenuItem>
            </Select>
            <Box sx={{ my: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Typography variant="body1">Filter Job Codes:</Typography>
                    </Grid>
                    <Grid item>
                        <input id="filter"
                            name="filter"
                            type="text"
                            value={jobfilter}
                            onChange={event => setJobfilter(event.target.value)}
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </Grid>
                    <Grid item>
                        <Button onClick={clearJobFilter} size="small" variant="outlined" disabled={!jobfilter}>Clear Job Filter</Button>
                    </Grid>
                    <Grid item>
                        <ErrorBoundary>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Filter on Trigger Date"
                                    value={datePickerValue}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            setValueString(newValue.format('YYYY-MM-DD'));
                                            setDatePickerValue(newValue)
                                        } else {
                                            setValueString('');
                                            setDatePickerValue(null);
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </ErrorBoundary>
                    </Grid>
                    <Grid item>
                        <Button onClick={clearDateFilter} size="small" variant="outlined" disabled={!valueString && !datePickerValue}>Clear Date Filter</Button>
                    </Grid>
                </Grid>
            </Box>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead sx={{ backgroundColor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Job Code</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Job ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sales Order ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Processed At</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trigger Date</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Amount</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RowName</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((item) => (
                            <TableRow key={uuid()} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                                <TableCell component="th" scope="row">{item.jobcode}</TableCell>
                                <TableCell>{item.jobid}</TableCell>
                                <TableCell>{item.salesorderid}</TableCell>
                                <TableCell>{item.invoiceid}</TableCell>
                                <TableCell>{item.timestamp.replace('2024-','')}</TableCell>
                                <TableCell>{item.triggerdate.split('T')[0].replace('2024-','')}</TableCell>
                                <TableCell align="right">{USDollar.format(item.amount/100.0)}</TableCell>
                                <TableCell>{item.rowname}</TableCell>
                                <TableCell>{item.created.replace('/2024','')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </ErrorBoundary>
            </>
            )
    }
    if (! invoices ) return <CircularProgress></CircularProgress>;
}
