// import fs from 'fs';
// import dotenv from 'dotenv'
import { useQueries } from "@tanstack/react-query";
import { Divider, Typography } from '@mui/material';
import MUIDataTable from "mui-datatables";
import CircularProgress from '@mui/material/CircularProgress';

// dotenv.config()

// const pre_Tk = process.env.REACT_APP_WEBSERVER_TOKEN
// const tk = pre_Tk.replace("+","$")
// console.log(tk)

export default function JAMFMachineInfo(props) {

    const columns = ['general', '_id']
    const options = {
      };

      const [jamf_machine_info] = useQueries({
        queries: [
          {
            queryKey: ["jamf_machine_info"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/jamf/computers_from_mongo",
              {
                methood: "GET",
                headers: {"x-token": "a4taego8aerg;oeu;ghak1934570283465g23745693^+&%^$#$#^$#^#nrghaoiughnoaergfo",
                        "Content-type": "application/json"
                }
              },
            ).then((res) => res.json()),
        },
        ]
    });
      if (jamf_machine_info.isLoading) return <CircularProgress></CircularProgress>;
      if (jamf_machine_info.error) return "An error has occurred: " + jamf_machine_info.error.message;
      if (jamf_machine_info.data) {
        console.log(jamf_machine_info.data)
        return (
            <>
            <h1>test</h1>
            {/* <p>{JSON.stringify(jamf_machine_info.data[0])}</p> */}
            <Typography variant='h4'>{props.name}</Typography>

            {jamf_machine_info.data.map((x) => {
              return(
                <>
                  <Typography variant='h5'>{x.general.name}</Typography>
                  <Typography variant="h6">Make: {x.hardware.make}  Model: {x.hardware.model}  Type: {x.hardware.processorType} IP {x.general.lastIpAddress} Last IP   {x.general.lastReportedIp}  </Typography>
                  <Typography variant="h6">Available Disk Space: {x.storage.bootDriveAvailableSpaceMegabytes} MB  Proc Count: {x.hardware.processorCount}   Proc Speed: {x.hardware.processorSpeedMhz} 
                   &nbsp;  Cores: {x.hardware.coreCount}  
                        OS: {x.operatingSystem.name}</Typography>
                  <Typography variant="p">OS: {x.operatingSystem.name} S/N: {x.hardware.serialNumber}
                  Version: {x.operatingSystem.version} Build: {x.operatingSystem.build}  AD Status: {x.operatingSystem.activeDirectoryStatus}
                  </Typography>


                  <Typography variant="p" > NIC Type {x.hardware.networkAdapterType} MAC: {x.hardware.macAddress} Alt MAC: {x.hardware.altMacAddress} 
                    &nbsp;  User Name: {x.userAndLocation.username}  Location: {x.userAndLocation.location}  Extension User: {JSON.stringify(x.userAndLocation.extensionAttributes[0].values)}  
                  </Typography>
                  <Divider></Divider>
                </>
              )
            }
            )}

            </>
            )
    
    }
}
