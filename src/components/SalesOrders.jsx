import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState, Component } from 'react';
import { Typography, Button, Chip, Select, MenuItem } from '@mui/material';
import { Paper, Grid } from '@mui/material'
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


export default function SalesOrders(props) {
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
            axios.get(`https://laxcoresrv.buck.local:8000/sales_order_info?_system=${table}`).then(function(response) {
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
            <Typography variant='h3'>{table} {props.name} </Typography>
            <Select
                labelId="invoice-table-select-id"
                id="table-select"
                value={table}
                label="System"
                onChange={handleTableChange}>
            <MenuItem value='SANDBOX'>Sandbox</MenuItem>
            <MenuItem value='PRODUCTION'>Production</MenuItem>
            </Select>
            <p>
              Type to filter Job Codes: &nbsp; &nbsp;
              <input id="filter"
                name="filter"
                type="text"
                value={jobfilter}
                onChange={event => setJobfilter(event.target.value)}
              /> &nbsp; &nbsp;
                <Button onClick={clearJobFilter} size="small" variant="contained">Clear Job Filter</Button>&nbsp; &nbsp;
              <ErrorBoundary>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Filter on Trigger Date"
                    value={datePickerValue}
                    onChange={(newValue) => {
                        // setDatePickerValue(newValue);
                        // console.log('DATE PICKER VALUE = ', datePickerValue);
                        console.log('new value ', newValue);
                        setValueString(newValue.format('YYYY-MM-DD'));
                    }}
                />
                </LocalizationProvider>
                </ErrorBoundary>
                &nbsp; &nbsp;
                <Button onClick={clearDateFilter} size="small" variant="contained">Clear Date Filter</Button>&nbsp; &nbsp;
              
            </p>
            <ul>
                {filteredData.map((item) => {
                    // console.log(item)
                    return <li key={uuid()}>
                            <Paper variant="outlined">
                                <Grid container columns={10}>
                                    <Grid item xs={1}>
                                        <Chip label="Job Code"></Chip>
                                        <Typography variant='body1'>{item.jobcode}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Job ID"></Chip>
                                        <Typography variant='body1'>{item.jobid}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Sales Order ID"></Chip>
                                        <Typography variant='body1'>{item.salesorderid}</Typography>
                                    </Grid>
                                    {/* <Grid item xs={1}>
                                        <Chip label="Invoice ID"></Chip>
                                        <Typography variant='body1'>{item.invoiceid}</Typography>
                                    </Grid> */}
                                    <Grid item xs={1}>
                                        <Chip label="Processed At"></Chip>
                                        <Typography variant='body1'>{item.timestamp.replace('2024-','')}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Trigger Date"></Chip>
                                        <Typography variant='body1'>{item.triggerdate.split('T')[0].replace('2024-','')}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Amount"></Chip>
                                        <Typography variant='body1'>{USDollar.format(item.amount/100.0)}</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Chip label="RowName"></Chip>
                                        <Typography variant='body1'>{item.rowname}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Created At"></Chip>
                                        <Typography variant='body1'>{item.created.replace('/2024','')}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                           </li>
                })}
            </ul>
            </ErrorBoundary>
            </>
            )
    }
    if (! invoices ) return <CircularProgress></CircularProgress>;
}

