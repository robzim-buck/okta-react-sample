import axios from 'axios';
import { Alert, AlertTitle, Divider, IconButton, Snackbar } from '@mui/material';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CloseIcon from '@mui/icons-material/Close';
// import Snackbar from '@mui/material/Snackbar';
// import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import Button from '@mui/material/Button'
import { Typography } from '@mui/material';
import { Grid } from '@mui/material'
import { Box } from '@mui/material';
import uuid from 'react-uuid';
import CircularProgress from '@mui/material/CircularProgress';


const endpoint = 'https://laxcoresrv.buck.local:8000'


export default function ReturnSelfServeLicenses(props) {
    const [successvisible, setSuccessvisible] = useState(false);
    const [previsible, setPrevisible ] = useState(false);
    const [product, setProduct] = useState('')
    const [operation, setOperation] = useState('')
    const [user, setUser] = useState('')

    const PreviewAlert = () => {
        if (previsible) {
            return(<>
              {}
              <Snackbar sx={{minWidth: 1400}} anchorOrigin={{vertical: 'top', horizontal: 'left'}} open={previsible} onClose={() => setPrevisible(false)}  autoHideDuration={3000} >
              <Alert sx={{minWidth: 1400}} action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="large"
                  onClick={() => {
                    setPrevisible(false)}}>
                  <AlertTitle>Processing...</AlertTitle>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              } severity="info">
                {operation} {product} License for {user}
              </Alert>
              </Snackbar>
              </>
            )
          }
      }
      
    
      const SuccessAlert = () => {
        if (successvisible) {
            return(<>
              {}
              <Snackbar sx={{minWidth: 1400}} anchorOrigin={{vertical: 'top', horizontal: 'left'}} open={successvisible} onClose={() => setSuccessvisible(false)}  autoHideDuration={3000} >
              <Alert sx={{minWidth: 1400}} action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="large"
                  onClick={() => {
                    setSuccessvisible(false);
                  }}>
                    <AlertTitle>Success!</AlertTitle>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }  icon={<CheckIcon fontSize="inherit" />} severity="success">
                Success {operation} {product} for {user}!
              </Alert>
    
              </Snackbar>
              </>
            )
          }
      }


  function releaseLicense(event, useremail, license) {
    if ( ! useremail.includes('buck.co') && ! useremail.includes('anyways.co') && ! useremail.includes('giantant.ca') ) {
      alert(`Only works for Buck, GiantAnt and Anyways Users, not for ${useremail}`)
      return
    }
    setOperation('Returning');
    setPrevisible(true)
    setProduct(license);
    setUser(useremail);
    const url = `${endpoint}/release_self_service_license?product=${license.toLowerCase()}&email=${useremail}`
    const result = axios.post(url).then(res => {
      setPrevisible(false)
      setSuccessvisible(true);
      return res.data + result
    })
  }


  const [filter, setFilter] = useState('');    


    const [oktausers] = useQueries({
        queries: [
          {
            queryKey: ["adobeUsers"],
            queryFn: () =>
            fetch("http://core-tools.buck.local:7000/buckokta/category/att/comparison/match?_category=users").then((res) => res.json()),
        },
        ]
    });
      if (oktausers.isLoading) return <CircularProgress></CircularProgress>;
      if (oktausers.error) return "An error has occurred: " + oktausers.error.message;
      if (oktausers.data) {

    const clearFilter = () => {
      setFilter('')
    }
    let sortedData = oktausers.data.sort((a, b) => a.profile.login.localeCompare(b.profile.login));
    if (sortedData) {
      let filteredData = sortedData;
      if (filter.length > 0) {
        console.log(sortedData)
        filteredData = sortedData.filter((f) => f.profile.login.includes(filter));
      }
      let myid = uuid()
        return (
            <>
            <Typography variant='h3'>{props.name} For {filteredData.length} Users</Typography>
            <PreviewAlert ></PreviewAlert>
            <SuccessAlert ></SuccessAlert>
            <p>
              Type to filter the list: &nbsp; &nbsp;
              <input id="filter"
                name="filter"
                type="text"
                value={filter}
                onChange={event => setFilter(event.target.value)}
              /> &nbsp; &nbsp;
            <Button onClick={clearFilter} size="small" variant="contained">Clear Filter</Button>
            </p>
            <Box sx={{ margin: 6 }}>

                {filteredData.map((item) => {
                    return <div key={myid+item.profile.login}>
                      <Divider sx={{ margin: 2 }}>{item.profile.displayName ? item.profile.displayName : ''} {item.profile.login ? item.profile.login : ''} </Divider>
                                <Grid container spacing={1}  columns={10}>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Adobe')}} size="small" variant="contained">Adobe  Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Acrobat')}} size="small" variant="contained">Acrobat Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Aquarium')}} size="small" variant="contained">Aquarium Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Maya')}} size="small" variant="contained">Maya Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Substance')}} size="small" variant="contained">Substance Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Parsec')}} size="small" variant="contained">Parsec Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'MSO365')}} size="small" variant="contained">Office Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Figma')}} size="small" variant="contained">Figma Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'Figjam')}} size="small" variant="contained">Figjam Return {item.profile.firstName}</Button>
                                  </Grid>
                                  <Grid item xs={1}>
                                  <Button onClick={(e) => {releaseLicense(e, item.profile.login, 'FigmaFigjam')}} size="small" variant="contained">FigmaFigjam Return {item.profile.firstName}</Button>
                                  </Grid>
                                </Grid>
                           </div>
                })}
                </Box>
            </>
            )
            }
    }
}


