/*
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { useOktaAuth } from '@okta/okta-react';
import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress,
  Card,
  CardContent,
  Link
} from '@mui/material';

const Home = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authState || !authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  const login = async () => {
    await oktaAuth.signInWithRedirect();
  };

  if (!authState) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Buck Web Tools
        </Typography>

        {authState.isAuthenticated && !userInfo && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {authState.isAuthenticated && userInfo && (
          <Card variant="outlined" sx={{ mt: 2, maxWidth: 700 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Welcome back, {userInfo.name}!
              </Typography>
              <Typography variant="body1">
                Visit the <Link href="/profile">My Profile</Link> page to take a look inside the ID token.
              </Typography>
            </CardContent>
          </Card>
        )}

        {!authState.isAuthenticated && (
          <Card variant="outlined" sx={{ mt: 2, maxWidth: 700 }}>
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Please log in to access Buck Web Tools.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={login} 
                id="login-button"
                sx={{ mt: 2 }}
              >
                Login
              </Button>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
};
export default Home;
