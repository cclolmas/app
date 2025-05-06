import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import CrossDebateNavbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <CrossDebateNavbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
