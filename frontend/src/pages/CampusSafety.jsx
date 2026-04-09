import React from 'react';
import InfoPage from './InfoPage';

const CampusSafety = () => {
  return (
    <InfoPage
      title="Campus Safety"
      subtitle="Simple guidelines to keep buying and selling safe on campus."
    >
      <h2 className="text-on-background text-xl font-extrabold mb-3">Meet safely</h2>
      <ul className="list-disc pl-5 mb-6">
        <li>Meet in public areas (Central Library, Foodys, Main Gate Plaza).</li>
        <li>Prefer daylight hours and bring a friend for high-value items.</li>
        <li>Do not share sensitive personal information in chats.</li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">Pay safely</h2>
      <ul className="list-disc pl-5 mb-6">
        <li>Verify UPI/transfer confirmation before handing over the item.</li>
        <li>For cash, count it carefully in a safe location.</li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">Inspect items</h2>
      <ul className="list-disc pl-5 mb-6">
        <li>Test electronics on the spot.</li>
        <li>Confirm accessories, chargers, bills (if promised).</li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">Report suspicious behavior</h2>
      <p>
        Use the report option on a listing if something looks suspicious. Moderation helps keep the marketplace trusted.
      </p>
    </InfoPage>
  );
};

export default CampusSafety;

