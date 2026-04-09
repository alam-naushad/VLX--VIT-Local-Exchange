import React from 'react';
import InfoPage from './InfoPage';

const Support = () => {
  return (
    <InfoPage
      title="Support"
      subtitle="Need help? Here are the quickest ways to solve common issues."
    >
      <h2 className="text-on-background text-xl font-extrabold mb-3">Common issues</h2>
      <ul className="list-disc pl-5 mb-6">
        <li>
          <b>Didn’t receive OTP:</b> check spam/junk, wait 1–2 minutes, and retry. In dev mode, OTP is printed in backend console.
        </li>
        <li>
          <b>Can’t upload images:</b> confirm Cloudinary keys are set in backend environment variables.
        </li>
        <li>
          <b>Listing looks wrong:</b> edit your listing details and re-check images/price/location.
        </li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">Contact</h2>
      <p className="mb-2">
        Email: <a className="text-primary font-extrabold hover:underline" href="mailto:alamnaushad4123@gmail.com">alamnaushad4123@gmail.com</a>
      </p>
    </InfoPage>
  );
};

export default Support;

