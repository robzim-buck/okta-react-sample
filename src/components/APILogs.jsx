import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { Typography } from '@mui/material';
import Select from '@mui/material/Select';
import uuid from 'react-uuid';
import {Box, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
export default function APILogs(props) {
    const [stuff, SetStuff] = useState('')
    const [fetchHost, SetFetchHost] = useState('nyc')
    const [logType, SetLogType] = useState('api')
    const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds default
    const [lastRefreshed, setLastRefreshed] = useState(new Date())
    const intervalRef = useRef(null);

    const handleHostChange = (event) => {
        SetFetchHost(event.target.value);
      };
    const handleLogChange = (event) => {
        SetLogType(event.target.value);
    };

    const fetchData = () => {
        axios.get(`https://laxcoresrv.buck.local:8000/${logType}_logs?host=${fetchHost}`).then(function(response) {
                let resData = response.data
                SetStuff(resData)
                setLastRefreshed(new Date())
            }).catch(function(error) {
            console.log(error)
        }).finally(function(response) {
            console.log('done')
            return(response)
        })
    }

    useEffect(() => {
        // Initial fetch
        fetchData()
        
        // Set up the interval for auto-refresh
        intervalRef.current = setInterval(fetchData, refreshInterval)
        
        // Clean up interval on component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [fetchHost, logType, refreshInterval])

    if (stuff) {
        return (
            <>
    <Select
    labelId="host-select-id"
    id="host-select"
    value={fetchHost}
    label="Host"
    onChange={handleHostChange}>
    <MenuItem value='nyc'>nyc</MenuItem>
    <MenuItem value='lax'>lax</MenuItem>        
    </Select>


    <Select
    labelId="log-select-id"
    id="log-select"
    value={logType}
    label="Log Type"
    onChange={handleLogChange}>
    <MenuItem value='api'>api</MenuItem>
    <MenuItem value='bolt'>bolt</MenuItem>
    </Select>

    <Select
    labelId="refresh-select-id"
    id="refresh-select"
    value={refreshInterval}
    label="Refresh"
    onChange={(e) => setRefreshInterval(e.target.value)}>
    <MenuItem value={5000}>5 seconds</MenuItem>
    <MenuItem value={15000}>15 seconds</MenuItem>
    <MenuItem value={30000}>30 seconds</MenuItem>
    <MenuItem value={60000}>1 minute</MenuItem>
    <MenuItem value={300000}>5 minutes</MenuItem>
    </Select>

                <Typography variant='h3'>{logType} {props.name} for {fetchHost}</Typography>
                <Typography variant='body2'>Last refreshed: {lastRefreshed.toLocaleTimeString()} (refreshes every {refreshInterval/1000} seconds)</Typography>
                {stuff.map((item) => {
                    return (
                        <Typography key={uuid()} variant='body1'>{item}</Typography>
                    )
                })}
            </>
            )
    }
    return (
            <Box sx={{ display: 'flex' }}>
                <CircularProgress color="inherit"></CircularProgress>
            </Box>
    )

}
