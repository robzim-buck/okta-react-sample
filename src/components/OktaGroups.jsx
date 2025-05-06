import { useQueries } from "@tanstack/react-query";

import { Divider, Typography } from '@mui/material';
// import { Paper } from '@mui/material'
import { Box, Grid, Chip } from '@mui/material';
// import uuid from 'react-uuid';
import CircularProgress from '@mui/material/CircularProgress';
import { Fragment } from "react";


export default function OktaGroups(props) {
    // const my_uuid = uuid()

    // const [stuff, SetStuff] = useState('') 
    const [oktausers] = useQueries({
        queries: [
          {
            queryKey: ["oktagroups"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buckokta/category/att/comparison/match?_category=groups").then((res) => res.json()),
        }]});
    if (oktausers.isLoading) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <Box sx={{ display: 'flex' }}>
                <CircularProgress color="inherit"></CircularProgress>
            </Box>
            </>
    
        )
    }
    if (oktausers.error) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <Box sx={{ display: 'flex' }}>
                <Typography color="inherit">{JSON.stringify(oktausers.error)}</Typography>
            </Box>
            </>
    
        )
    }
    if (oktausers.data) {
        // console.log(typeof oktausers.data, oktausers.data)
        if (oktausers.data.detail === "Not Found") {
            return (
                <>
                <Typography variant='h3'>{props.name}</Typography>
                <Box sx={{ display: 'flex' }}>
                    <Typography color="inherit">Not Found!</Typography>
                </Box>
                </>
    
            )
        }
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
                {oktausers.data.map((item) => {
                    // console.log(item);
                    return <Fragment key={item.id}>
                            {/* <img alt={item.profile.name} height="100px" src={item._links.logo[1].href ? item._links.logo[1].href : './buck-logo-tiny.png'} />  */}
                            <Divider textAlign="left"></Divider>
                            <Grid container columns={8}>
                                <Grid size={2}>
                                      <Chip variant="outlined" label={item.profile.description ? item.profile.description : 'no description'}></Chip>
                                  </Grid>
                                  <Grid size={2}>
                                      <Chip variant="outlined" label={item.profile.name}></Chip>
                                  </Grid>
                                  <Grid size={1}>
                                        <Chip variant="outlined" label={item.id}></Chip>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body2">Created <Chip variant="outlined" label={item.created.split('T')[0]}></Chip></Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body2">Last Updated <Chip variant="outlined" label={item.lastUpdated.split('T')[0]}></Chip></Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body2">Membership Updated <Chip variant="outlined" label={item.lastMembershipUpdated.split('T')[0]}></Chip></Typography>
                                  </Grid>
                            </Grid>
                           </Fragment>
                })}
            </>
            )
    
    }

}

