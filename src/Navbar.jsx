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
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  ContactMail as ContactMailIcon,
  Badge as BadgeIcon,
  Groups as GroupsIcon,
  Computer as ComputerIcon,
  List as ListIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Storage as ServerIcon,
  Apple as AppleIcon,
  Laptop as LaptopIcon,
  AccountTree as AccountTreeIcon,
  Dns as StorageIcon,
  Flag as FlagIcon, // Safe option that definitely exists
  Share as ShareIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  ShoppingCart as ShoppingCartIcon,
  Wifi as WifiIcon,
  BarChart as BarChartIcon,
  ConfirmationNumber as TicketIcon,
  Terminal as TerminalIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Login as LoginIcon
} from '@mui/icons-material';

const Navbar = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [collapsed, setCollapsed] = useState({
    userManagement: true,
    licenseManagement: true,
    infrastructure: true,
    storage: true,
    finance: true,
    monitoring: true,
    account: true
  });

  const toggleCollapse = (section) => {
    setCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const login = async () => oktaAuth.signInWithRedirect();
  const logout = async () => oktaAuth.signOut();

  if (!authState) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 0, overflow: 'hidden', height: '100%', boxShadow: 'none', backgroundColor: 'transparent' }}>
      <Box sx={{ pt: 2, pb: 1, display: 'flex', justifyContent: 'center' }}>
        <Box 
          component="img" 
          src="/Buck Square Logo.png" 
          alt="Buck Logo" 
          sx={{ width: '90%', maxHeight: 60, objectFit: 'contain' }}
        />
      </Box>
      <Divider />
      
      <List component="nav" dense sx={{ width: '100%', pt: 1 }}>
        {authState.isAuthenticated && (
          <>
            {/* User Management */}
            <ListItemButton
              onClick={() => toggleCollapse('userManagement')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="User Management"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.userManagement ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.userManagement} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Alphabetically sorted user management items */}
                <ListItemButton component={Link} to="/adobegroups" id="adobe-groups-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><GroupsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Adobe Groups" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/adobeusers" id="adobe-users-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><BadgeIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Adobe Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/docusignusers" id="docusign-users-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Docusign Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/googleusers" id="google-users-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Google Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/ldapusers" id="ldap-users-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><ContactMailIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="LDAP Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/oktagroups" id="okta-groups-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Okta Groups" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/oktalocations" id="okta-locations-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><LocationOnIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Okta Locations" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/oktausers" id="okta-users-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Okta Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/parsecusers" id="parsecusers-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><ComputerIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Parsec Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/zoomusers" id="zoom-users-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Zoom Users" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>

                {/* Keep Add Okta User at the end, after all the display items */}
                <ListItemButton component={Link} to="/onboardnewuser" id="onboard-user-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="OnBoard New User" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* License Management */}
            <ListItemButton
              onClick={() => toggleCollapse('licenseManagement')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <BadgeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="License Management"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.licenseManagement ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.licenseManagement} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/activeselfservelicenses" id="active-licenses-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><ListIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Active Self Serve Licenses" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/grantselfservelicenses" id="grant-licenses-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Grant Licenses" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/returnselfservelicenses" id="return-licenses-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><RemoveIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Return Licenses" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/rlmlicenseinfo" id="rlm-license-info-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="RLM License Info" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Infrastructure */}
            <ListItemButton
              onClick={() => toggleCollapse('infrastructure')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <ServerIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Infrastructure"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.infrastructure ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.infrastructure} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/vmwarehosts" id="vmwarehosts-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><ServerIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="VMWare Hosts" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/jamfmachineinfo" id="jamfmachineinfo-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><AppleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="JAMF Machine Info" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/ldapmachineinfo" id="ldapmachineinfo-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><LaptopIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="LDAP Machine Info" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/compositemachineinfo" id="compositemachineinfo-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><AccountTreeIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Composite Machine Info" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/physicaldrives" id="physicaldrives-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><StorageIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Physical Drives" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Storage */}
            <ListItemButton
              onClick={() => toggleCollapse('storage')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <StorageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Storage"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.storage ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.storage} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/hammerspaceobjectives" id="hammerspace-objectives-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><FlagIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Hammerspace Objectives" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/hammerspaceshares" id="hammerspace-shares-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Hammerspace Shares" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/hammerspacesites" id="hammerspace-sites-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><LocationOnIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Hammerspace Sites" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Finance */}
            <ListItemButton
              onClick={() => toggleCollapse('finance')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Finance"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.finance ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.finance} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/invoices" id="invoices-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Invoices" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/salesorders" id="salesorders-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><ShoppingCartIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Sales Orders" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Monitoring & Tools */}
            <ListItemButton
              onClick={() => toggleCollapse('monitoring')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <BarChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Monitoring & Tools"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.monitoring ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.monitoring} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/saltping" id="salt-ping-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><WifiIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Salt Ping" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/parsecleoreport" id="parsecleoreport-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><BarChartIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Parsec Leo Report" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/zendesktickets" id="zendesktickets-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><TicketIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Zendesk Tickets" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton component={Link} to="/apilogs" id="logs-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><TerminalIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Logs" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Account */}
            <ListItemButton
              onClick={() => toggleCollapse('account')}
              sx={{
                py: 0.5,
                minHeight: 36,
                fontSize: '0.875rem',
                '& .MuiListItemIcon-root': { minWidth: 32 }
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Account"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
              />
              {collapsed.account ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={!collapsed.account} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton component={Link} to="/profile" id="profile-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
                <ListItemButton onClick={logout} id="logout-button" sx={{ pl: 4, py: 0.5, minHeight: 32 }}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}
        {!authState.isAuthenticated && (
          <ListItemButton
            onClick={login}
            sx={{
              py: 0.5,
              minHeight: 36,
              fontSize: '0.875rem',
              '& .MuiListItemIcon-root': { minWidth: 32 }
            }}
          >
            <ListItemIcon><LoginIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary="Login"
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 'medium' }}
            />
          </ListItemButton>
        )}
      </List>
    </Paper>
  );
};
export default Navbar;