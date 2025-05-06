import uuid from 'react-uuid';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import { Typography, Button } from '@mui/material';
import { Chip, Grid, Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

// import { DataGrid } from '@mui/x-data-grid';



const setColor = (param) => {
    if (param < sixty_minutes / 2.0) {
        return 'error'
    }
    if (param < (sixty_minutes * 2.0)) {
        return 'warning'
    }
    return 'success'
}


const sixty_minutes = 60 * 60 * 1000;
// const twenty_four_hours_plus_buffer = (24*60*60*1000) + 20000; // add 20 seconds

const four_days_plus_buffer = (24*60*60*1000*4) + 60000 * 60; // add 60 minutes
const six_days_plus_buffer = (24*60*60*1000*6) + 60000 * 60; // add 60 minutes
const seven_days_plus_buffer = (24*60*60*1000*7) + 60000 * 60; // add 60 minutes

const setExpiryLabel = (param) => {
    if (param < 0) {
        return 'Expired'
    }
    if (param < (sixty_minutes * 2.0)) {
        return 'Expiring'
    }
    if (param < sixty_minutes) {
        return `Expires in ${(param/sixty_minutes*100).toPrecision(2)} Minutes`
    }
    return 'Good'
}



const setDateColor = (param) => {
    let todaystring = new Date(Date.now()).toISOString().split('T')[0];
    let paramstring = new Date(param).toISOString().split('T')[0];
    // console.log(todaystring, paramstring)
    if ( paramstring === todaystring ) {
        return 'red'
    }
    return 'black'
}


const setChipLabel = (param) => {
    if (param < 0) {
        return 'Expired'
    }
    if (param < (sixty_minutes * 2.0)) {
        return 'Expiring'
    }
    return 'Active'
}



const setExtendedLabel = (issued, expiry, product) => {
    let issued_date = new Date(issued);
    let expiry_date = new Date(expiry);
    let diff = expiry_date - issued_date;
    // console.log(diff, four_days_plus_buffer)
    if (product === 'mso365') {
        if (diff > seven_days_plus_buffer) {
            return 'Extended'
        }
        return 'Active'
    }
    if (product === 'aquarium') {
        if (diff > six_days_plus_buffer) {
            return 'Extended'
        }
        return 'Active'
    }
    else {
        if (diff > four_days_plus_buffer) {
            return 'Extended'
        }
        return 'Active'
    }
}


const productCount = (list, product) => {
    let aCount = list.reduce((counter, list) => list.product === product ? ++counter : counter , 0);
    return aCount
}


const emailUniqueEntries = (list) => {
    let emailList = list.map(em => { return em.email });
    let emailSet = new Set(emailList)
    // console.log(item in emailSet)
    // let listForCounting = new Array(emailSet)
    let count = 0
    for (let a of emailSet.entries()) {
        a = 1
        count += a
    }
    // console.log(emailSet.entries().next())
    return count
}


const year = new Date().getFullYear().toString()
// console.log(year)
export default function ActiveSelfServLicenses(props) {
    console.log('ActiveSelfServLicenses')
    const [emailfilter, setEmailFilter] = useState('');   
    const [productfilter, setProductFilter] = useState('');   
    const [activeLicenses] = useQueries({
        queries: [
          {
            queryKey: ["activeLicenses"],
            queryFn: () =>
            fetch("https://laxcoresrv.buck.local:8000/self_service_license_info").then((res) => res.json()),
        },
        ]
    });

    const clearEmailFilter = () => {
        setEmailFilter('')
      }
    
    const clearProductFilter = () => {
        setProductFilter('')
      }
    if (activeLicenses.isLoading) return <CircularProgress></CircularProgress>;
    if (activeLicenses.error) return "An error has occurred: " + activeLicenses.error.message;
    if (activeLicenses.data) {
        let sortedData = activeLicenses.data.sort((a, b) => a.email.localeCompare(b.email));
        let filteredData = sortedData;
        var extendedCount;
        if (emailfilter.length > 0) {
          console.log(sortedData)
          filteredData = sortedData.filter((f) => f.email.includes(emailfilter));
        }

        if (productfilter.length > 0) {
            console.log(sortedData)
            filteredData = sortedData.filter((f) => f.product.includes(productfilter));
          }
  
        if (sortedData) {
            extendedCount = sortedData.filter((x) => {
                if ( setExtendedLabel(x.timestamp, x.expiry, x.proudct) === 'Extended' ) return(true); else return(false)
                } 
            ).length
    
        }

           return (
            <>
            <Box sx={{ margin: 2 }}>
            <Typography  variant='h5'>{activeLicenses.data.length ? props.name : 'No ' + props.name}</Typography>
            <Typography variant='body1'>{productCount(sortedData, 'adobe')} Adobe + {productCount(sortedData, 'acrobat')} Acrobat + {productCount(sortedData, 'substance')} Substance +
            {productCount(sortedData, 'figma')} Figma + 
            {productCount(sortedData, 'figjam')} Figmjam  + {productCount(sortedData, 'figmafigjam')} Figma/Figmjam  + 
            {productCount(sortedData, 'mso365')}  MS Office 365 for a total of {sortedData.length} Licenses for {emailUniqueEntries(sortedData)} Users  with {extendedCount ? extendedCount : ''} Extensions</Typography>

            {/* <Typography variant='body2'> Diff = {(productCount(sortedData, 'adobe')+productCount(sortedData, 'acrobat')+productCount(sortedData, 'substance')+
            productCount(sortedData, 'figma')+productCount(sortedData, 'figjam')+productCount(sortedData, 'figmafigjam')+productCount(sortedData, 'mso365')) - sortedData.length} </Typography> */}
              Type email to filter the list of Licensed Users: &nbsp; &nbsp;
              <input id="emailfilter"
                name="emailfilter"
                type="text"
                value={emailfilter}
                onChange={event => setEmailFilter(event.target.value)}
              /> &nbsp; &nbsp;
            <Button onClick={clearEmailFilter} size="small" variant="contained">Clear Email Filter</Button>
            &nbsp; &nbsp;
            Type product to filter the list of Licensed Users: &nbsp; &nbsp;
              <input id="productfilter"
                name="productfilter"
                type="text"
                value={productfilter}
                onChange={event => setProductFilter(event.target.value)}
              /> &nbsp; &nbsp;


            <Button onClick={clearProductFilter} size="small" variant="contained">Clear Product Filter</Button>

                {filteredData.map((item) => {
                    let expiry = Date.parse(item.expiry);
                    let timeToExpire = expiry - Date.now();
                    let durationOfLicense = Date.parse(item.expiry) - Date.parse(item.timestamp);
                    let durationString = durationOfLicense / ( 60 * 60 * 24 * 1000 )


                    // console.log(typeof expiry, typeof timeToExpire)
                    const numCols = 38
                    return <Grid columns={numCols}  container key={uuid()}>
                        <Grid item size={3}>
                            <Chip variant="outlined" size="small" color={setColor(timeToExpire)} label={setChipLabel(timeToExpire)}></Chip>
                        </Grid>
                        <Grid item size={7}>
                            <Typography color={setDateColor(item.expiry)} variant='body2'>{item.email}</Typography>
                        </Grid>
                        <Grid item size={6}>
                            <Typography color={setDateColor(item.expiry)} variant='body2'><Chip variant="outlined" size="small"  color={setColor(timeToExpire)} label="Product"></Chip> {item.product}</Typography>
                        </Grid>
                        <Grid item size={7}>
                            <Typography color={setDateColor(item.expiry)}  variant='body2'><Chip variant="outlined" size="small"  color={setColor(timeToExpire)} label="Issued"></Chip> {item.timestamp ? item.timestamp.replace(`${year}-`, "").replace('T', " ") : ''}</Typography>
                        </Grid>
                        <Grid item size={7}>
                            <Typography color={setDateColor(item.expiry)} variant='body2'><Chip variant="outlined" size="small" color={setColor(timeToExpire)}  label="Expires"></Chip> {item.expiry ? item.expiry.replace(`${year}-`, "").replace('T', " ") : ''}</Typography>
                        </Grid>
                        <Grid item size={3}>
                            <Typography color={setDateColor(item.expiry)}  variant='body2'><Chip variant="outlined" size="small"  color={setColor(timeToExpire)} label="Days"></Chip> {durationString.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography color={setDateColor(expiry)} variant='body2'>{setExpiryLabel(timeToExpire)} </Typography>
                        </Grid>

                        <Grid item size={3}>
                            <Chip variant="outlined" size="small" color={setColor(timeToExpire)} label={setExtendedLabel(item.timestamp, item.expiry, item.product)}></Chip>
                        </Grid>
                        <Grid item size={numCols}>
                            <LinearProgress color={setColor(timeToExpire)} variant='determinate' value={(100 - timeToExpire/sixty_minutes*100)} />
                       </Grid>
                    </Grid>
                })}
            </Box>

            {/* <Box sx={{ width: '100%' }}>
            <DataGrid
                rows={sortedData}
                columns={columns}
                getRowId={(row ) =>  row.email + row.product}
                initialState={{
                pagination: {
                    paginationModel: {
                    pageSize: 10,
                    },
                },
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                disableRowSelectionOnClick
            />
            </Box> */}
            </>)
    }
}

