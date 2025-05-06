import { Chip } from '@mui/material'
import { Typography, Divider, Paper } from '@mui/material';
import { Grid } from '@mui/material';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';


export default function HammerspaceSites(props) {

        const [hammerspaceSites] = useQueries({
        queries: [
          {
            queryKey: ["hammerspaceSites"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/hammerspace?item=sites",
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
      if (hammerspaceSites.isLoading) return <CircularProgress></CircularProgress>;
      if (hammerspaceSites.error) return "An error has occurred: " + hammerspaceSites.error.message;
      if (hammerspaceSites.data) {


        console.log(
            "Got Hammerspace Sites Data: ", hammerspaceSites.data
        );
        let sortedData = hammerspaceSites.data.sort((a, b) => a.name.localeCompare(b.name));


    if (sortedData) {
        return (
            <>
            <Paper sx = {{ border: "10px", margin: "30px" }}>
            <Typography variant='h3'>{props.name}</Typography>
            {sortedData.map((site) => {
                return(
                    <>
                    <Divider sx={{  height: "10px"  }}></Divider>
                    <Grid key={site.uoid.uuid} container columns={15} spacing={1}>
                    <Grid item size={2}>
                        <Typography variant='h6'>{site.name}</Typography>
                    </Grid>
                    <Grid item size={3}>
                        <Chip variant="outlined" color="success" label={"Mgmt Address " + site.mgmtAddress}></Chip>
                    </Grid>
                    <Grid item size={3}>
                        <Chip variant="outlined" color="success" label={"Data Address " + site.dataAddress}></Chip>
                    </Grid>
                    <Grid item size={3}>
                        <Chip variant="outlined" color="success" label={"Created " + new Date(site.created).toDateString()}></Chip>
                    </Grid>
                    <Grid item size={3}>
                        <Chip variant="outlined" color="success" label={"Modified " + new Date(site.modified).toDateString()}></Chip>
                    </Grid>
                    <Grid item size={1}>
                        <Chip variant="outlined" color="success" label={"ID " + site.internalId}></Chip>
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