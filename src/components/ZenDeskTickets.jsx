import axios from 'axios';
import dayjs from 'dayjs';

// import Accordion from '@mui/material/Accordion';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


// import Button from '@mui/material/Button'
import { useEffect, useState, Component } from 'react';
import { Typography, Button, Chip, Select, MenuItem } from '@mui/material';
import { Paper, Grid } from '@mui/material'
// import { useQueries } from "@tanstack/react-query";
import uuid from 'react-uuid';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker, LocalizationProvider }  from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

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


export default function ZenDeskTickets(props) {
    const [valueString, setValueString] = useState('')
    const [tickets, setTickets] = useState('');
    const [subjectfilter, setSubjectFilter] = useState('');
    const [status, setStatus] = useState('new');
    const [value, setValue] = useState(dayjs(''));

    const handleTableChange = (event) => {
        setTickets('')
        setStatus(event.target.value);
    };
        useEffect(() => {
            axios.get(`https://laxcoresrv.buck.local:8000/zendesk_query?querystring=type%3Aticket%20status%3A${status}`).then(function(response) {
                console.log(response.status)
                    let resData = response.data;
                    console.log(`fetched ${resData.length} invoices`)
                    setTickets(resData)
                }).catch(function(error) {
                console.log(error)
                alert(`Error ${error} Getting Data from lax server.  Do you have the cert installed?`)
                return;
            }).finally( () =>  {
                console.log('finally!')
            } )
        }, [status])
    

    if (tickets) {

        let filteredData = tickets;


        const clearJobFilter = () => {
            setSubjectFilter('')
        }


        const clearDateFilter = () => {
            setValueString('')
            setValue(dayjs(''))
        }


        if (subjectfilter.length > 0) {
          filteredData = tickets.filter((f) => f.subject.toUpperCase().includes(subjectfilter.toUpperCase()));
        }

        if (valueString.length > 0) {
            filteredData = tickets.filter((f) => f.updated_at.includes(valueString));
        }


        if (valueString.length === 0 && subjectfilter.length === 0) {
            filteredData = tickets;
        }


        // let filteredlist = invoices.data.value.filter((line) => (line.name.includes('LAVDI') && line.name.includes('VM')))
        return (
            <>
            <ErrorBoundary>
            <Typography variant='h3'>{status} {props.name} </Typography>
            <Select
                labelId="invoice-table-select-id"
                id="table-select"
                value={status}
                label="System"
                onChange={handleTableChange}>
            <MenuItem value='new'>New</MenuItem>
            <MenuItem value='open'>Open</MenuItem>
            <MenuItem value='pending'>Pending</MenuItem>
            <MenuItem value='closed'>Closed</MenuItem>
            </Select>
            <p>
              Type to filter Subjects: &nbsp; &nbsp;
              <input id="filter"
                name="filter"
                type="text"
                value={subjectfilter}
                onChange={event => setSubjectFilter(event.target.value)}
              /> &nbsp; &nbsp;
                <Button onClick={clearJobFilter} size="small" variant="contained">Clear Subject Filter</Button>&nbsp; &nbsp;
              <ErrorBoundary>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Filter on Date Last Updated"
                    value={value}
                    onChange={(newValue) => {setValue(newValue);
                        console.log(value);
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
                                <Grid container columns={13}>
                                    <Grid item xs={2}>
                                        <Chip label="Subject"></Chip>
                                        <Typography variant='body1'>{item.subject}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Chip label="Description"></Chip>
                                        <Typography variant='body1'>{item.description}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Priority"></Chip>
                                        <Typography variant='body1'>{item.priority}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="From"></Chip>
                                        <Typography variant='body1'>{item.via.source.from.name}</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Chip label="Email"></Chip>
                                        <Typography variant='body1'>{item.via.source.from.address}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Status"></Chip>
                                        <Typography variant='body1'>{item.status}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="ID"></Chip>
                                        <Typography variant='body1'>{item.id}</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Chip label="Last Updated"></Chip>
                                        <Typography variant='body1'>{item.updated_at}</Typography>
                                    </Grid>

                                    {/* <Grid item xs={1}>
                                        <Chip label="JSON"></Chip>
                                        <Accordion>
                                            <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                            >
                                            click to see raw JSON
                                            </AccordionSummary>
                                            <AccordionDetails>{JSON.stringify(item)}
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grid> */}
                                </Grid>
                            </Paper>
                           </li>
                })}
            </ul>
            </ErrorBoundary>
            </>
            )
    }
    if (! tickets ) return <CircularProgress></CircularProgress>;
}

