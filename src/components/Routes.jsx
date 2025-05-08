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

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginCallback } from '@okta/okta-react';
import { RequiredAuth } from './SecureRoute';
import Home from '../pages/Home';
import Loading from './Loading';
import Profile from '../pages/Profile';
import APILogs from './APILogs';
import SaltPing from './SaltPing';
import ActiveSelfServLicenses from './ActiveSelfServLicenses';
import GrantSelfServeLicenses from './GrantSelfServeLicenses';
import ReturnSelfServeLicenses from './ReturnSelfServeLicenses';
import Invoices from './Invoices';
import SalesOrders from './SalesOrders';
import ParsecLeoReport from './ParsecLeoReport';
import VMWareHosts from './VMWareHosts';
import ZenDeskTickets from './ZenDeskTickets';
import JAMFMachineInfo from './JAMFMachineInfo';
import HammerspaceShares from './HammerspaceShares';
import HammerspaceObjectives from './HammerspaceObjectives';
import HammerspaceSites from './HammerspaceSites';
import PhysicalDrives from './PhysicalDrives';
import LDAPMachineInfo from './LDAPMachineInfo';
import OktaUsers from './OktaUsers';
import OktaGroups from './OktaGroups';
import LDAPUsers from './LDAPUsers';
import CompositeMachineInfo from './CompositeMachineInfo';
import AdobeUsers from './AdobeUsers';
import AdobeGroups from './AdobeGroups';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" exact={true} element={<Home/>}/>
      <Route path="login/callback" element={<LoginCallback loadingElement={<Loading/>}/>}/>
      {/* <Route path="/messages" element={<RequiredAuth/>}>
        <Route path="" element={<Messages/>}/>
      </Route> */}
      <Route path="/profile" element={<RequiredAuth/>}>
        <Route path="" element={<Profile/>}/>
      </Route>

      <Route path="/adobeusers" element={<RequiredAuth/>}>
        <Route path="" element={<AdobeUsers/>}/>
      </Route>
      <Route path="/adobegroups" element={<RequiredAuth/>}>
        <Route path="" element={<AdobeGroups />}/>
      </Route>


      <Route path="/apilogs" element={<RequiredAuth/>}>
        <Route path="" element={<APILogs/>}/>
      </Route>
      <Route path="/saltping" element={<RequiredAuth/>}>
        <Route path="" element={<SaltPing/>}/>
      </Route>
      <Route path="/activeselfservelicenses" element={<RequiredAuth/>}>
        <Route path="" element={<ActiveSelfServLicenses/>}/>
      </Route>
      <Route path="/grantselfservelicenses" element={<RequiredAuth/>}>
        <Route path="" element={<GrantSelfServeLicenses name="Grant Licenses" />}/>
      </Route>
      <Route path="/returnselfservelicenses" element={<RequiredAuth/>}>
        <Route path="" element={<ReturnSelfServeLicenses  name="Return Licenses" />}/>
      </Route>

      <Route path="/physicaldrives" element={<RequiredAuth/>}>
        <Route path="" element={<PhysicalDrives/>}/>
      </Route>

      <Route path="/ldapmachineinfo" element={<RequiredAuth/>}>
        <Route path="" element={<LDAPMachineInfo/>}/>
      </Route>


      <Route path="/hammerspaceshares" element={<RequiredAuth/>}>
        <Route path="" element={<HammerspaceShares/>}/>
      </Route>

      <Route path="/hammerspaceobjectives" element={<RequiredAuth/>}>
        <Route path="" element={<HammerspaceObjectives/>}/>
      </Route>
      <Route path="/hammerspacesites" element={<RequiredAuth/>}>
        <Route path="" element={<HammerspaceSites/>}/>
      </Route>





      <Route path="/oktausers" element={<RequiredAuth/>}>
        <Route path="" element={<OktaUsers/>}/>
      </Route>
      <Route path="/oktagroups" element={<RequiredAuth/>}>
        <Route path="" element={<OktaGroups/>}/>
      </Route>



      <Route path="/jamfmachineinfo" element={<RequiredAuth/>}>
        <Route path="" element={<JAMFMachineInfo/>}/>
      </Route>
      <Route path="/zendesktickets" element={<RequiredAuth/>}>
        <Route path="" element={<ZenDeskTickets/>}/>
      </Route>


      <Route path="/ldapusers" element={<RequiredAuth/>}>
        <Route path="" element={<LDAPUsers/>}/>
      </Route>



      <Route path="/compositemachineinfo" element={<RequiredAuth/>}>
        <Route path="" element={<CompositeMachineInfo/>}/>
      </Route>

      <Route path="/parsecleoreport" element={<RequiredAuth/>}>
        <Route path="" element={<ParsecLeoReport/>}/>
      </Route>

      <Route path="/vmwarehosts" element={<RequiredAuth/>}>
        <Route path="" element={<VMWareHosts/>}/>
      </Route>


      <Route path="/invoices" element={
        <RequiredAuth allowedEmail="rob.zimmelman@buck.co,gsuite.holding@buck.co">
          <Invoices />
        </RequiredAuth>
      }/>


      <Route path="/salesorders" element={
        <RequiredAuth allowedEmail="rob.zimmelman@buck.co,gsuite.holding@buck.co">
          <SalesOrders />
        </RequiredAuth>
      }/>
    </Routes>
  );
};

export default AppRoutes;
