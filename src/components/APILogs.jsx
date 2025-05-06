import axios from 'axios';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Select from '@mui/material/Select';
import uuid from 'react-uuid';
import {Box, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
export default function APILogs(props) {
    const [stuff, SetStuff] = useState('')
    const [fetchHost, SetFetchHost] = useState('nyc')
    const [logType, SetLogType] = useState('api')
    const handleHostChange = (event) => {
        SetFetchHost(event.target.value);
      };
    const handleLogChange = (event) => {
        SetLogType(event.target.value);
    };

    useEffect((props) => {
        axios.get(`https://laxcoresrv.buck.local:8000/${logType}_logs?host=${fetchHost}`).then(function(response) {
                let resData = response.data
                SetStuff(resData)
            }).catch(function(error) {
            console.log(error)
        }).finally(function(response) {
            console.log('done')
            return(response)
        } )
    }, [fetchHost, logType])

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
    label="Host"
    onChange={handleLogChange}>
    <MenuItem value='api'>api</MenuItem>
    <MenuItem value='bolt'>bolt</MenuItem>
    </Select>


                <Typography variant='h3'>{logType} {props.name} for {fetchHost}</Typography>
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
