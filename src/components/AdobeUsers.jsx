import { Grid, Chip, Box, Divider, List, ListItem, ListItemText, Paper, Typography }  from "@mui/material";
import { useState } from "react";
import uuid from 'react-uuid'
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';


export default function AdobeUsers() {
    const [filter, setFilter] = useState('')
    const [filteredlist, setFilteredlist] = useState();
    const [adobeUsers] = useQueries({
        queries: [
          {
            queryKey: ["adobeUsers"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/adobe_users").then((res) => res.json()),
        },
        ]
    });
      if (adobeUsers.isLoading) return <CircularProgress></CircularProgress>;
      if (adobeUsers.error) return "An error has occurred: " + adobeUsers.error.message;
      if (adobeUsers.data) {
    let sortedData = adobeUsers.data.sort((a, b) => a.email.localeCompare(b.email));

    if (sortedData) {
        let active = sortedData.filter((i) => i.status === 'active')
        let inactive = sortedData.filter((i) => i.status !== 'active')
        let adobeid = sortedData.filter((i) => i.type === 'adobeID')
        let federatedid = sortedData.filter((i) => i.type === 'federatedID')
        const myChangeFunc = (val) => {
            console.log('val', val, typeof val)
            if (val === '') {
                setFilteredlist([]);
                setFilter('');
            } else {
                setFilteredlist(
                    sortedData.filter((item) =>
                      item.username.toLowerCase().includes(val.toLowerCase())
                    )
                  );
            }
          };
    return (
    <>
        <Box sx={{ width: "100%", maxWidth: 2400, maxHeight: 600,  bgcolor: "background.paper" }}>
        <Typography variant="h3">&nbsp;Adobe Info</Typography>
        <Typography variant="body1">&nbsp;scroll to see more</Typography>

        {/* <Typography variant="body1">FilteredList Name</Typography>
            <Input defaultValue={filter}
              inputRef={filter}
              onChange={(event) => myChangeFunc(event.target.value)}/>
        <Button onClick={()=>{setFilteredlist([]);setFilter('')}} >Clear</Button> */}

        {/* <Paper variant="raised" style={{maxHeight: 600, overflow: 'auto'}}>
            <List>
            {filteredlist ? filteredlist.map((stuff) => {
                console.log(stuff)
                return (
                    <Fragment key={myuuid+stuff.username}>
                    <ListItem >
                    <Grid container spacing={2}>
                        <Grid med={2}>
                                <Chip size="small" color = "primary" label={stuff.firstname + " " + stuff.lastname} secondary= {stuff.username + " " + stuff.country + " " +  stuff.email}></Chip>
                        </Grid>
                        <Grid med={2}>
                                <Chip size="small" color = "primary" label={stuff.domain}></Chip>
                        </Grid>
                        <Grid med={2}>
                            <Chip size="small" color={(stuff.businessAccount) ? "warning" : "success"} variant="bordered" label={stuff.businessAccount? "Business Account": "Account"}></Chip>
                        </Grid>
                        <Grid  med={2}>
                            <Chip size="small" color={(stuff.orgSpecific) ? "primary" : "success"} variant="bordered" label={(stuff.orgSpecific) ? "Org Specific": "Not Org Specific"}></Chip>
                        </Grid>
                        <Grid  med={2}>
                            <Chip size="small" color={(stuff.type==="adobeID") ? "success" : "primary"} variant="bordered" label={stuff.type}></Chip>
                        </Grid>
                    </Grid>
                    </ListItem>
                </Fragment>
                );
            }):<Typography variant="body1">&nbsp;Type in Input Above for Filtered List</Typography>}
            </List>
            </Paper> */}
        </Box>
        <Box sx={{ width: "100%", maxWidth: 1800, bgcolor: "background.paper" }}>
        <Typography variant="h3">&nbsp;Full List of Adobe Users</Typography>
        <Typography variant="h4">&nbsp; {federatedid.length} Federated Users &nbsp;{adobeid.length} Adobe Users &nbsp;{active.length} Active Users &nbsp;{inactive.length} Inactive Users </Typography>
        <Typography variant="body1">&nbsp;scroll to see more</Typography>
        {/* <nav aria-label="main mailbox folders"> */}
        <Paper variant="raised"   style={{maxHeight: 1000, overflow: 'auto'}}>
            <List>
            {sortedData.map((stuff) => {
                return (
                <div key={uuid()}>
                    <ListItem key={uuid()}>
                    <ListItemText primary={stuff.firstname + " " + stuff.lastname} secondary= {stuff.username + " " + stuff.country + " " +  stuff.email}></ListItemText>
                    </ListItem>
                    <ListItem>
                    <Grid container columns={5} spacing={2}>
                        <Grid item xs={1}></Grid>
                        <Grid item xs={1}>
                                <Chip size="small" color = "primary" label={stuff.domain}></Chip>
                        </Grid>
                        <Grid item xs={1}>
                            <Chip size="small" color={(stuff.businessAccount) ? "warning" : "success"} variant="bordered" label={stuff.businessAccount? "Business Account": "Account"}></Chip>
                        </Grid>
                        <Grid item xs={1}>
                            <Chip size="small" color={(stuff.orgSpecific) ? "primary" : "success"} variant="bordered" label={(stuff.orgSpecific) ? "Org Specific": "Not Org Specific"}></Chip>
                        </Grid>
                        <Grid item xs={1}>
                            <Chip size="small" color={(stuff.type==="adobeID") ? "success" : "primary"} variant="bordered" label={stuff.type}></Chip>
                        </Grid>

                        {stuff.groups ? stuff.groups.map((gp) => {
                                return(
                                    <Grid item xs={2} size="small" variant="bordered">
                                        <Chip size="small" variant="outlined" color = "primary" label={gp}></Chip>
                                    </Grid>
                                    )
                            }): ''}
                    </Grid>

                    </ListItem>
                    <Divider></Divider>
                    {/* <ListItem>
                        <ListItemText secondary={JSON.stringify(stuff)}></ListItemText>
                    </ListItem> */}
                </div>
                );
            })}
            </List>
            </Paper>
        {/* </nav> */}
        </Box>
    </>
    )
    }
  }
}
