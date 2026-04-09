import React from 'react';
import InfoPage from './InfoPage';

const PrivacyPolicy = () => {
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="We collect the minimum data required to run a safe, verified campus marketplace."
    >
      <h2 className="text-on-background text-xl font-extrabold mb-3">1. What we collect</h2>
      <ul className="list-disc pl-5 mb-6">
        <li>Account info: name, college email, verification status</li>
        <li>Profile info you choose to add: year, WhatsApp number</li>
        <li>Listings you create: title, description, price, images, location</li>
        <li>Basic logs for security and abuse prevention</li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">2. Why we collect it</h2>
      <p className="mb-6">
        We use this information to verify students, display listings, enable contact between buyers and sellers, and moderate abuse.
      </p>

      <h2 className="text-on-background text-xl font-extrabold mb-3">3. Sharing</h2>
      <p className="mb-6">
        We do not sell personal data. Your WhatsApp number is shown to others only if you add it to your profile and a buyer opens a
        listing that you posted.
      </p>

      <h2 className="text-on-background text-xl font-extrabold mb-3">4. Security</h2>
      <p className="mb-6">
        We use authentication, verification, and access control to protect accounts. No system is perfect—please use safe meetup
        practices.
      </p>

      <h2 className="text-on-background text-xl font-extrabold mb-3">5. Changes</h2>
      <p>
        We may update this policy. Continued use of the platform means you accept the updated policy.
      </p>
    </InfoPage>
  );
};

export default PrivacyPolicy;

