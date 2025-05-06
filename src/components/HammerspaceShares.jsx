import { Chip } from '@mui/material'
import { Typography, Divider, Paper } from '@mui/material';
import { Grid } from '@mui/material';
import uuid from 'react-uuid';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';


export default function HammerspaceShares(props) {
    const [hammerspaceShares] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceShares"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=shares",
                {
                methood: "GET",
                headers: {"x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                }
              },
            ).then((res) => res.json()),
        },
        ]
    });
      if (hammerspaceShares.isLoading) return <CircularProgress></CircularProgress>;
      if (hammerspaceShares.error) return "An error has occurred: " + hammerspaceShares.error.message;
      if (hammerspaceShares.data) {

    let sortedData = hammerspaceShares.data.sort((a, b) => a.name.localeCompare(b.name));
    if (sortedData) {
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            {sortedData.map((shareItem) => {
                return(
                    <>
            <Paper sx = {{ border: "10px", margin: "30px" }}>
            <Divider sx={{  height: "10px"  }}></Divider>
                    <Grid container columns={4} spacing={0}>
                    <Grid item xs={1} key={uuid()}>
                        <Typography variant='h6'>{shareItem.name}</Typography>
                    </Grid>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={1}>
                        <Chip variant="filled" color="success" label={"Path " + shareItem.path}></Chip>
                    </Grid>
                    <Grid item xs={1}>
                        <Chip variant="filled" color="success" label={"Group ID " + shareItem.shareState}></Chip>
                    </Grid>
                    <Grid item xs={1}></Grid>
                        {shareItem.shareObjectives ? shareItem.shareObjectives.map(o => {
                            return(
                                <>
                                <Grid item xs={3}></Grid>
                                <Grid item xs={1}>
                                    <Chip size='small' key={uuid()} variant="filled" color="info" label={"Objective " + o.objective.name}></Chip>
                                </Grid>
                                </>
                            )
                        }) : ''}
                    </Grid>
                    </Paper>
                    </>
                )
            })}
            </>
            )
            }
    }
    }