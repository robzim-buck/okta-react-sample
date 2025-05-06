import { useQueries } from "@tanstack/react-query";
import { Typography } from '@mui/material';
import MUIDataTable from "mui-datatables";


import CircularProgress from '@mui/material/CircularProgress';
export default function LDAPMachineInfo(props) {

    const columns = ['name', 'operatingSystem', 'operatingSystemVersion', 'isCriticalSystemObject',
                      'pwdLastSet','whenCreated',
                      'whenChanged','lastLogon','logonCount','lastLogonTimestamp',
                      'objectGUID']
    const options = {
        filterType: 'checkbox',
        rowsPerPageOptions: [10,25,50,250,500,1000],
        downloadOptions: {'filename': 'ldap_machine_info.csv'},
        selectableRows: 'none'
      };

      const [ldap_machine_info] = useQueries({
        queries: [
          {
            queryKey: ["ldap_machine_info"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/buckldap_machineinfo").then((res) => res.json()),
        },
        ]
    });
      if (ldap_machine_info.isLoading) return <CircularProgress></CircularProgress>;
      if (ldap_machine_info.error) return "An error has occurred: " + ldap_machine_info.error.message;
      if (ldap_machine_info.data) {
        // console.log(ldap_machine_info.data)
        return (
            <>
            <Typography variant='h3'>{props.name}</Typography>
            <MUIDataTable
            title={"LDAP Machine Info"}
            data={ldap_machine_info.data}
            columns={columns}
            options={options}
            />
            </>
            )
    
    }
}
