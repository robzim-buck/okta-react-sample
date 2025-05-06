import axios from 'axios';
import { Typography, Button } from '@mui/material';
import { useQueries } from "@tanstack/react-query";
import CircularProgress from '@mui/material/CircularProgress';
import MUIDataTable from "mui-datatables";


function powerOff(event, host) {
    console.log('powering off', host)
    alert(`Powering off ${host}`)
    const result = axios.get(`https://laxcoresrv.buck.local:8000/vmware_power?vm=${host}&instruction=stop`).then(function(response) {
        console.log(result, response.data)
        alert(`Powered off ${host}`)
    })
}


function powerOn(event, host) {
    console.log('powering on', host)
    alert(`Powering on ${host}`)
    const result = axios.get(`https://laxcoresrv.buck.local:8000/vmware_power?vm=${host}&instruction=start`).then(function(response) {
        console.log(result, response.data)
        alert(`Powered on ${host}`)
    })
}

const options = {
    selectableRows: false
  };

const columns = [
    {
      name: 'host',
      label: 'host',
      options: {
        filter: true,
        sort: true,
       }
    },
    {
        name: 'vm',
        label: 'vm',
        options: {
            filter: false,
            sort: true,
           }
          },
      {
        name: 'MB',
        label: 'MB',
        options: {
            filter: false,
            sort: true,
           }
          },
      {
        name: 'power_state',
        label: 'power_state',
        options: {
            filter: true,
            sort: true,
           }
          },
      {
        name: 'cpus',
        label: 'cpus',
        options: {
            filter: false,
            sort: true,
           }
          },
      {
        name: 'off',
        label: 'off',
        options: {
            filter: false,
            sort: false,
           }
          },
      {
        name: 'on',
        label: 'on',
        options: {
            filter: false,
            sort: false,
           }
          },
  
    ]


export default function VMWareHosts(props) {
       const [vmwarehosts] = useQueries({
        queries: [
          {
            queryKey: ["vmwarehosts"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/vmware_hosts").then((res) => res.json()),
        },
        ]
    }, {refetchInterval: 10000});
      if (vmwarehosts.isLoading) return <CircularProgress></CircularProgress>;
      if (vmwarehosts.error) return "An error has occurred: " + vmwarehosts.error.message;
      if (vmwarehosts.data) {
        let filteredlist = vmwarehosts.data.value.filter((line) => (line.name.includes('VDI') && line.name.includes('VM')))


        let formattedlist = filteredlist.map((item) => {
            let itemdict = {'host': item.name, 'vm': item.vm, 'MB': item.memory_size_MiB, 'power_state': item.power_state,
            'cpus': item.cpu_count,
            'off': <Button disabled={item.power_state==='POWERED_OFF'} onClick={(e) => {powerOff(e, item.vm)}}>Power Off {item.name}</Button>,
            'on': <Button disabled={item.power_state==='POWERED_ON'} onClick={(e) => {powerOn(e, item.vm)}}>Power On {item.name}</Button>
        }
                return (
                    itemdict
                )}
        )

        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <MUIDataTable
            title={props.name}
            data={formattedlist}
            columns={columns}
            options={options}
            />
            </>
            )
    }
}

