import { useQueries } from "@tanstack/react-query";
import { Typography, Grid, Chip } from '@mui/material';
import MUIDataTable from "mui-datatables";

import CircularProgress from '@mui/material/CircularProgress';
export default function ParsecLeoReport(props) {
    const columns = ['host', 'name', 'email','machine_online','created','updated','last_connected', 'leo_user', 'leo_client_assignment', 'leo_user_assignment']
    const options = {
        filterType: 'checkbox',
        rowsPerPageOptions: [10,25,50,250,500,1000],
        downloadOptions: {'filename': 'parsec_assignments.csv'},
        selectableRows: 'none'
      };
      let yourDate = new Date()
      let today = yourDate.toISOString().split('T')[0]
      
      const [parsecinfo] = useQueries({
        queries: [
          {
            queryKey: ["parsecinfo"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/parsec_leo_report").then((res) => res.json()),
        },
        ]
    });
      if (parsecinfo.isLoading) return <CircularProgress></CircularProgress>;
      if (parsecinfo.error) return "An error has occurred: " + parsecinfo.error.message;
      if (parsecinfo.data) {

        // console.log(parsecinfo.data)
        // console.log('today ', today)
        let onlineUsers = parsecinfo.data.filter(x => x.machine_online === 'Online').length
        let connectedTodayUsers = parsecinfo.data.filter(x => x.last_connected === today).length
        let noLeoUsers = parsecinfo.data.filter(x => x.leo_user === 'No Leo User').length
        // console.log('online ', onlineUsers)
        // console.log('last connected today ', connectedTodayUsers)
        return (
            <>
              <Typography variant='h3'>{props.name} User / Machine Assignments</Typography>
              <Grid container columns={4}>
              <Grid item sm={1}>
                <Chip label={`${parsecinfo.data.length} Parsec Users`}></Chip>
              </Grid>
              <Grid item sm={1}>
              <Chip label={`${onlineUsers} Online Leo Users`}></Chip>
              </Grid>
              <Grid item sm={1}>
                <Chip label={`${connectedTodayUsers} Last Connected = Today`}></Chip>
              </Grid>
              <Grid item sm={1}>
                <Chip label={`${noLeoUsers} Machines with No Leo Users`}></Chip>
              </Grid>
            </Grid>

            <MUIDataTable
            title={"Parsec Connections"}
            data={parsecinfo.data}
            columns={columns}
            options={options}
            />
            </>
            )
    
    }
}
