import { useQueries } from "@tanstack/react-query";

import { Typography } from '@mui/material';
import { Paper } from '@mui/material'
import { Box, Grid, Chip } from '@mui/material';
import uuid from 'react-uuid';
import CircularProgress from '@mui/material/CircularProgress';


export default function OktaUsers(props) {
    const [oktausers] = useQueries({
        queries: [
          {
            queryKey: ["oktausers"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buckokta/category/att/comparison/match?_category=users").then((res) => res.json()),
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
                    return <div key={item.id}>
                            <Paper style={{height: 120, overflow: 'auto'}}  variant="outlined">
                            <Grid container rowSpacing={3}>
                                <p></p>
                                <Grid size={12}></Grid>
                                  <Grid size={1}>
                                      <Typography variant='body1'>{item.profile.displayName ? item.profile.displayName : 'No Display Name'}</Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body1">{item.profile.firstName}</Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body1">{item.profile.lastName}</Typography>
                                  </Grid>
                                  <Grid size={2}>
                                      <Typography variant="body1">{item.profile.login}</Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Chip variant="outlined" label={item.profile.description}></Chip>
                                  </Grid>
                                  <Grid size={1}>
                                        <Chip variant="outlined" label={item.id}></Chip>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body1">{item.profile.activated}</Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body1">Updated {item.lastUpdated ? item.lastUpdated.split('T')[0] :''}</Typography>
                                  </Grid>
                                  <Grid size={2}>
                                      <Typography variant="body1">{item.profile.title}</Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body1">{item.profile.city}</Typography>
                                  </Grid>
                                  <Grid size={2}>
                                      <Typography variant="body1">{item.profile.email}</Typography>
                                  </Grid>
                                  <Grid size={1}>
                                      <Typography variant="body1">Loged In {item.lastLogin ? item.lastLogin.split('T')[0] : 'No Logins'}</Typography>
                                  </Grid>
                                  <Grid size={3}><a href={item._links.self.href}>{item._links.self.href}</a></Grid>
                                  </Grid>
                                
                            </Paper>
                           </div>
                })}
            </>
            )
    
    }

}

