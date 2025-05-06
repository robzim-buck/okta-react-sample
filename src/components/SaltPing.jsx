import { useQueries } from "@tanstack/react-query";

import { Typography } from '@mui/material';
import { Paper } from '@mui/material'
import { Box, Grid, Chip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';



export default function SaltPing(props) {
    const options = {
        method: 'POST',
        headers: {
          'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
        }
      };
    const [saltpingresults] = useQueries({
        queries: [
          {
            queryKey: ["saltping"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/salt/ping",
                options
            ).then((res) => res.json()),
        }]});
    if (saltpingresults.isLoading) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <Box sx={{ display: 'flex' }}>
                <CircularProgress color="inherit"></CircularProgress>
            </Box>
            </>
    
        )
    }
    if (saltpingresults.error) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <Box sx={{ display: 'flex' }}>
                <Typography color="inherit">{JSON.stringify(saltpingresults.error)}</Typography>
            </Box>
            </>
    
        )
    }
    if (saltpingresults.data) {
        return (
            <>
            <Paper style={{height: 2500, overflow: 'auto', borer: "100px"}}  variant="outlined">

                    <Typography variant='h3'>{props.name}</Typography>
                    <Grid container columns={16} rowSpacing={2}>
                        {saltpingresults.data.map((item) => {
                        return(
                            <>
                            <Grid item xs={1} key={item.host}>
                                <Grid container columns={1}>
                                   <Grid item xs={1}>
                                        <Chip  color={item.up === "true" ? "success" : "error"} label={item.host}> </Chip>
                                    </Grid>
                                    </Grid>
                            </Grid>
                        </>

                        )

                        })}
                    </Grid>

            </Paper>
            </>
            )
    
    }

}

