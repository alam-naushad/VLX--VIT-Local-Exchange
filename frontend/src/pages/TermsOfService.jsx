import React from 'react';
import InfoPage from './InfoPage';

const TermsOfService = () => {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle="By using VLX, you agree to follow campus rules and trade responsibly."
    >
      <h2 className="text-on-background text-xl font-extrabold mb-3">1. Eligibility</h2>
      <p className="mb-6">VLX is intended for verified campus users. You must use a valid institutional email to access the platform.</p>

      <h2 className="text-on-background text-xl font-extrabold mb-3">2. Listings</h2>
      <ul className="list-disc pl-5 mb-6">
        <li>Do not post illegal, unsafe, or prohibited items.</li>
        <li>Do not post misleading descriptions or fake images.</li>
        <li>You are responsible for what you list and sell.</li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">3. Transactions</h2>
      <p className="mb-6">
        VLX is a peer-to-peer platform. We do not guarantee any transaction outcome. Always inspect items before paying.
      </p>

      <h2 className="text-on-background text-xl font-extrabold mb-3">4. Abuse & moderation</h2>
      <p className="mb-6">
        We may remove listings, restrict features, suspend, or ban accounts that violate rules or harm trust/safety.
      </p>

      <h2 className="text-on-background text-xl font-extrabold mb-3">5. Liability</h2>
      <p>
        Use the platform at your own risk. VLX is not liable for disputes, losses, or damages arising from trades between users.
      </p>
    </InfoPage>
  );
};

export default TermsOfService;

