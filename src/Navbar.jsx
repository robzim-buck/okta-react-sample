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
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Icon, Image, Menu } from 'semantic-ui-react';

const Navbar = () => {
  const { authState, oktaAuth } = useOktaAuth();

  const login = async () => oktaAuth.signInWithRedirect();
  const logout = async () => oktaAuth.signOut();

  if (!authState) {
    return null;
  }

  return (
    <div>
      <Menu vertical>
        <Container>
          <Menu.Item header>
            <Image size="tiny" src="/Buck Square Logo.png" />
            &nbsp;
            <Link to="/"></Link>
          </Menu.Item>
          {authState.isAuthenticated && (
            <>

          <Menu.Item id="logs-button">
            <Link to="/apilogs">Logs</Link>
          </Menu.Item>


            <Menu.Item id="profile-button">
              <Link to="/profile">Profile</Link>
            </Menu.Item>



            <Menu.Item id="active-licenses-button">
              <Link to="/activeselfservelicenses">Active Licenses</Link>
            </Menu.Item>



            <Menu.Item id="grant-licenses-button">
              <Link to="/grantselfservelicenses">Grant Licenses</Link>
            </Menu.Item>
            <Menu.Item id="return-licenses-button">
              <Link to="/returnselfservelicenses">Return Licenses</Link>
            </Menu.Item>



            <Menu.Item id="parsecleoreport-button">
              <Link to="/parsecleoreport">Parsec Leo Report</Link>
            </Menu.Item>
            <Menu.Item id="vmwarehosts-button">
              <Link to="/vmwarehosts">VMWare Hosts</Link>
            </Menu.Item>

            <Menu.Item id="jamfmachineinfo-button">
              <Link to="/jamfmachineinfo">JAMF Machine Info</Link>
            </Menu.Item>


            <Menu.Item id="zendesktickets-button">
              <Link to="/zendesktickets">Zendesk Tickets</Link>
            </Menu.Item>

            <Menu.Item id="hammerspace-objectives-button">
              <Link to="/hammerspaceobjectives">Hammerspace Objectives</Link>
            </Menu.Item>

            <Menu.Item id="hammerspace-shares-button">
              <Link to="/hammerspaceshares">Hammerspace Shares</Link>
            </Menu.Item>
            <Menu.Item id="hammerspace-sites-button">
              <Link to="/hammerspacesites">Hammerspace Sites</Link>
            </Menu.Item>


            <Menu.Item id="physicaldrives-button">
              <Link to="/physicaldrives">Physical Drives</Link>
            </Menu.Item>
            <Menu.Item id="ldapmachineinfo-button">
              <Link to="/ldapmachineinfo">LDAP Machine Info</Link>
            </Menu.Item>


            <Menu.Item id="invoices-button">
              <Link to="/invoices">Invoices</Link>
            </Menu.Item>
            <Menu.Item id="salesorders-button">
              <Link to="/salesorders">Sales Orders</Link>
            </Menu.Item>


            <Menu.Item id="okta-users-button">
              <Link to="/oktausers">Okta Users</Link>
            </Menu.Item>
            <Menu.Item id="okta-groups-button">
              <Link to="/oktagroups">Okta Groups</Link>
            </Menu.Item>





            <Menu.Item id="logout-button" onClick={logout}>Logout</Menu.Item>



            </>
          )}
          {!authState.isAuthenticated && (
            <>
            <Menu.Item onClick={login}>Login</Menu.Item>
            </>
          )}
        </Container>
      </Menu>
    </div>
  );
};
export default Navbar;
