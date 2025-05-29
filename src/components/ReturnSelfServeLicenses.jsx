import { Alert, AlertTitle, Divider, IconButton, Snackbar, Chip } from '@mui/material';
import { useState } from 'react';
import { useQueries } from "@tanstack/react-query";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import Button from '@mui/material/Button'
import { Typography } from '@mui/material';
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
    const url = `${endpoint}/licenses/release_self_service_license?product=${license.toLowerCase()}&email=${useremail}`

    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
      }
    })
    .then(response => response.json())
    .then(data => {
      setPrevisible(false)
      setSuccessvisible(true);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
      setPrevisible(false);
    });
  }


  const [filter, setFilter] = useState('');    


  const [oktausers] = useQueries({
    queries: [
      {
        queryKey: ["oktausers"],
        queryFn: () =>
        fetch("https://laxcoresrv.buck.local:8000/buckokta/category/att/comparison/match?_category=users",
          {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-token': 'a4taego8aerg;oeu;ghak1934570283465g23745693^$&%^$#$#^$#^#$nrghaoiughnoaergfo'
          }
        }).then((res) => res.json()),
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
            <Box sx={{ margin: 2 }}>
                {filteredData.map((item) => {
                    return <div key={myid+item.profile.login}>
                      <Divider sx={{ margin: 1 }}>{item.profile.displayName ? item.profile.displayName : ''} {item.profile.login ? item.profile.login : ''} </Divider>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                  <Chip 
                                    label="Adobe" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Adobe')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Acrobat" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Acrobat')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Aquarium" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Aquarium')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Maya" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Maya')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Substance" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Substance')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Parsec" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Parsec')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Office" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'MSO365')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Figma" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Figma')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="Figjam" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'Figjam')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                  <Chip 
                                    label="FigmaFigjam" 
                                    onClick={(e) => {releaseLicense(e, item.profile.login, 'FigmaFigjam')}} 
                                    clickable 
                                    color="primary" 
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                </Box>
                           </div>
                })}
                </Box>
            </>
            )
            }
    }
}


