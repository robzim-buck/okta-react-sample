// import { Component } from "react";
import { useQueries } from "@tanstack/react-query";
import { Typography,  Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Paper } from '@mui/material'
import { Divider, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';


const AdobeUserData = (props) => {
    return (
        <>
    <Typography variant='h3'>{props.name}</Typography>
    <ul>
        {props.componentdata.map((item) => {
            console.log(item);
            return <li key={item.id}>
                    <Paper variant="outlined">
                    <Typography variant='h5'>User Name {item.username}</Typography>
                    <Typography variant='h6'>Email {item.email}</Typography>
                    <Typography variant='h6'>Status {item.status}</Typography>
                    <Typography variant='body2'>Domain {item.domain} </Typography>
                    <Typography variant='body1'>Country {item.country} </Typography>
                    <Typography variant='body1'>Type {item.type} </Typography>
                    <Divider></Divider>
                    {JSON.stringify(item)}
                    </Paper>
                    <Divider></Divider>
                   </li>
        })}
    </ul>
    </>
    )
}

export default function AdobeGroupMembers(props) {
    const [substanceMembers, admins] = useQueries({
        queries: [
          {
            queryKey: ["substanceMembers"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/adobe_users_in_group?group=493246826").then((res) => res.json()),
            },
            {
            queryKey: ["admins"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/adobe_users_in_group?group=929919").then((res) => res.json()),
            },
        ]
    });
    if (admins.isLoading && substanceMembers.isLoading ) return <CircularProgress></CircularProgress>;
    if (admins.error || substanceMembers.error ) return "An error has occurred: " + substanceMembers.error.message + admins.error.message;

        if (admins.data && substanceMembers.data && substanceMembers.data.length > 0) {
            console.log(substanceMembers.data)
            let adminsortedData = admins.data.users.sort((a, b) => a.email.localeCompare(b.email));
            let sortedData = substanceMembers.data.users.sort((a, b) => a.email.localeCompare(b.email));
          return (
            <>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="admins-header"
                    >
                    click to see Adobe Admins
                    </AccordionSummary>
                    <AccordionDetails>
                        <AdobeUserData name='Adobe Admins' componentdata={adminsortedData} ></AdobeUserData>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="substance-header"
                    >
                    click to see Adobe Substance Users
                    </AccordionSummary>
                    <AccordionDetails>
                        <AdobeUserData name='Adobe Substance Members' componentdata={sortedData} ></AdobeUserData>
                    </AccordionDetails>
                </Accordion>



            </>
            )
          
          
          }
  


    //     if (substanceMembers.isLoading) return <CircularProgress></CircularProgress>;
    //     if (substanceMembers.error) return "An error has occurred: " + substanceMembers.error.message;
    //     if (substanceMembers.data) {
    //   }
  

    return (
        <>
        <Typography variant='h3'>{props.name} Users</Typography>
        <Box sx={{ display: 'flex' }}>
            <CircularProgress color="inherit"></CircularProgress>
        </Box>
        </>

    )

}
