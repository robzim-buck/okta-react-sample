// import axios from 'axios';
import uuid from 'react-uuid';
// import { useEffect, useState } from 'react';
import { useQueries } from "@tanstack/react-query";
// import Button from '@mui/material/Button'
import { Typography } from '@mui/material';
import { Paper } from '@mui/material'
import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export default function PhysicalDrives(props) {
    const [nydrives, ladrives, amsdrives, syddrives] = useQueries({
        queries: [
          {
            queryKey: ["nydrives"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buck_pysicaldrives?site=NY").then((res) => res.json()),
        },
        {
            queryKey: ["ladrives"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buck_pysicaldrives?site=LA").then((res) => res.json()),
        },
        {
            queryKey: ["amsdrives"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buck_pysicaldrives?site=AMS").then((res) => res.json()),
        },
        {
            queryKey: ["syddrives"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buck_pysicaldrives?site=SYD").then((res) => res.json()),
        },
        ]
    });
      if (nydrives.isLoading || ladrives.isLoading || amsdrives.isLoading || syddrives.isloading ) return <CircularProgress></CircularProgress>;
      if (nydrives.error || ladrives.error || amsdrives.error || syddrives.error ) return "An error has occurred: " + nydrives.error.message + ladrives.error.message + amsdrives.error.message + syddrives.error.message;
      if (nydrives.data && amsdrives.data && syddrives.data && ladrives.data ) {
    // let sortedData = nydrives.data.sort((a, b) => a.name.localeCompare(b.name));
    let nySortedData = nydrives.data;
    // let amsSortedData = amsdrives.data;
    let sydSortedData = syddrives.data;
    let laSortedData = ladrives.data.Media_Assets_View;
        return (
            <>
            <Typography variant='h3'>NY {props.name}</Typography>
            <Paper style={{maxHeight: 200, overflow: 'auto'}} variant="outlined">
            <ul>
                {nySortedData.map((item) => {
                    return <li key={uuid()}>
                            {JSON.stringify(item)}
                           </li>
                })}
            </ul>
            </Paper>
            <Typography variant='h3'>Amsterdam {props.name}</Typography>
            <Paper style={{maxHeight: 200, overflow: 'auto'}} variant="outlined">
            <ul>
                {amsdrives.data}
                {/* {amsdrives.data.map((item) => {
                    return <li key={uuid()}>
                            {JSON.stringify(item)}
                           </li>
                })} */}
            </ul>
            </Paper>    
            <Typography variant='h3'>Los Angeles {props.name}</Typography>
            <Paper style={{maxHeight: 200, overflow: 'auto'}} variant="outlined">
            <ul>
                {laSortedData.map((item) => {
                    return <li key={uuid()}>
                            {JSON.stringify(item)}
                           </li>
                })}
            </ul>
            </Paper>    
            
            <Typography variant='h3'>Sydney {props.name}</Typography>
            <Paper style={{maxHeight: 200, overflow: 'auto'}} variant="outlined">
            <ul>
                {sydSortedData.map((item) => {
                    return <li key={uuid()}>
                            {JSON.stringify(item)}
                           </li>
                })}
            </ul>
            </Paper>    
            </>
            )
        }
    // let laSortedData = ladrives.data;
    // if (laSortedData) {
    //     return (
    //         <>
    //         <Typography variant='h3'>NY {props.name}</Typography>
    //         <Paper style={{maxHeight: 200, overflow: 'auto'}} variant="outlined">
    //         <ul>
    //             {laSortedData.map((item) => {
    //                 return <li key={uuid()}>
    //                         {JSON.stringify(item)}
    //                        </li>
    //             })}
    //         </ul>
    //         </Paper>    
    //         </>
    //         )
    //     }
    // }

    // let amsSortedData = amsdrives.data;
    // if (amsSortedData) {
    //     return (
    //         <>
    //         <Typography variant='h3'>NY {props.name}</Typography>
    //         <Paper style={{maxHeight: 200, overflow: 'auto'}} variant="outlined">
    //         <ul>
    //             {amsSortedData.map((item) => {
    //                 return <li key={uuid()}>
    //                         {JSON.stringify(item)}
    //                        </li>
    //             })}
    //         </ul>
    //         </Paper>    
    //         </>
    //         )
    //     }
    // }
    return (
        <>
        <Box sx={{ display: 'flex' }}>
            <CircularProgress color="inherit"></CircularProgress>
        </Box>
    </>
    )

}

