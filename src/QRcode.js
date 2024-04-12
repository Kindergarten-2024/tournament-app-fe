import React from 'react';
import './QRcode.css';
import qr from './images/qrcode.png';

function QRcode() {
  return (
    <div className='Qr'>
        <h1 className='start2p'>Register to Opap Tournament</h1>
        <img
          src={qr}
          className="centered-image"
          alt="Centered Image"
        />
    </div>
  );
}

export default QRcode;