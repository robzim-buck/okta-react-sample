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

import React, { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { toRelativeUrl } from '@okta/okta-auth-js';
import { Outlet } from 'react-router-dom';
import Loading from './Loading';

export const RequiredAuth = ({ allowedEmail, children }) => {
  const { oktaAuth, authState } = useOktaAuth();
  useEffect(() => {
    if (!authState) {
      return;
    }

    if (!authState?.isAuthenticated) {
      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuth.setOriginalUri(originalUri);
      oktaAuth.signInWithRedirect();
    }
  }, [oktaAuth, !!authState, authState?.isAuthenticated]);

  if (!authState) {
    return (<Loading />);
  }

  if (!authState.isAuthenticated) {
    return (<Loading />);
  }

  // if (allowedEmail && authState.idToken?.claims?.email !== allowedEmail) {
  //   return <div>You do not have permission to access this page.</div>;
  // }
  
  const allowedEmailList = allowedEmail ? allowedEmail.split(','): '';
  console.log('allowedEmailList', allowedEmailList);
  if (allowedEmailList && (allowedEmailList.includes(authState.idToken?.claims?.email) === false) ) {
    return <div>You do not have permission to access this page.</div>;
  }

  return children ? <>{children}</> : <Outlet />;
}
