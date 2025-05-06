import { Chip } from '@mui/material'
import { Typography, Divider, Paper } from '@mui/material';
import { Grid } from '@mui/material';
import uuid from 'react-uuid';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';


export default function HammerspaceObjectives(props) {
    const [hammerspaceObjectives] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceObjectives"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=objectives",
                {
                methood: "GET",
                headers: {"x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                }
              },).then((res) => res.json()),
        },
        ]
    });
      if (hammerspaceObjectives.isLoading) return <CircularProgress></CircularProgress>;
      if (hammerspaceObjectives.error) return "An error has occurred: " + hammerspaceObjectives.error.message;
      if (hammerspaceObjectives.data) {

    let sortedData = hammerspaceObjectives.data.sort((a, b) => a.name.localeCompare(b.name));
    if (sortedData) {
        return (
            <>
            <Paper sx = {{ border: "10px", margin: "30px" }}>
            <Typography variant='h3'>{props.name}</Typography>
            {sortedData.map((shareItem) => {
                return(
                    <>
                    <Divider sx={{  height: "10px"  }}></Divider>
                    <Grid container columns={4} spacing={1}>
                    <Grid item xs={2} key={uuid()}>
                        <Typography variant='h6'>{shareItem.name}</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Chip variant="outlined" color="success" label={"Created " + new Date(shareItem.created).toDateString()}></Chip>
                    </Grid>
                    <Grid item xs={1}>
                        <Chip variant="outlined" color="success" label={"Modified " + new Date(shareItem.modified).toDateString()}></Chip>
                    </Grid>
                    </Grid>
                    </>
                )
            })}
            </Paper>
            </>
            )
            }
    }
    }