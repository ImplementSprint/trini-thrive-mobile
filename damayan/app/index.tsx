import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';

import { CitizenDashboardScreen, CitizenSignupScreen } from '../citizen';
import { UnifiedLoginScreen } from '../loginportal';
import { isCitizenRole, isSiteManagerRole } from '../roles';
import { SiteManagerDashboardScreen, SiteManagerSignupScreen } from '../site-manager';
import type { AppRoute } from '../types';

export default function DamayanApp() {
  const [route, setRoute] = useState<AppRoute>('login');

  switch (route) {
    case 'login':
      return (
        <>
          <StatusBar style="dark" />
          <UnifiedLoginScreen
            onLoginSuccess={(role) => {
              if (isSiteManagerRole(role)) {
                setRoute('site-manager-before');
              } else if (isCitizenRole(role)) {
                setRoute('citizen-dashboard');
              }
            }}
            onCreateAccount={() => setRoute('citizen-signup')}
          />
        </>
      );
    case 'site-manager-signup':
      return (
        <>
          <StatusBar style="dark" />
          <SiteManagerSignupScreen
            onBack={() => setRoute('login')}
            onSubmit={() => setRoute('login')}
          />
        </>
      );
    case 'site-manager-before':
    case 'site-manager-during':
    case 'site-manager-dashboard':
      return (
        <>
          <StatusBar style="dark" />
          <SiteManagerDashboardScreen onSignOut={() => setRoute('login')} />
        </>
      );
    case 'citizen-signup':
      return (
        <>
          <StatusBar style="dark" />
          <CitizenSignupScreen
            onBack={() => setRoute('login')}
            onSubmit={() => setRoute('citizen-dashboard')}
          />
        </>
      );
    case 'citizen-dashboard':
    case 'citizen-before':
    case 'citizen-before-self':
    case 'citizen-before-household':
    case 'citizen-before-household-members':
    case 'citizen-during':
    case 'citizen-after':
      return (
        <>
          <StatusBar style="dark" />
          <CitizenDashboardScreen
            onSignOut={() => setRoute('login')}
            onSiteManagerSession={() => setRoute('site-manager-before')}
          />
        </>
      );
    default:
      return (
        <>
          <StatusBar style="dark" />
          <UnifiedLoginScreen
            onLoginSuccess={(role) => {
              if (isSiteManagerRole(role)) {
                setRoute('site-manager-before');
              } else if (isCitizenRole(role)) {
                setRoute('citizen-dashboard');
              }
            }}
            onCreateAccount={() => setRoute('citizen-signup')}
          />
        </>
      );
  }
}
