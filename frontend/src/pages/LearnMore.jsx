import React from 'react';
import InfoPage from './InfoPage';

const LearnMore = () => {
  return (
    <InfoPage
      title="Learn More"
      subtitle="VLX is a verified campus-only marketplace designed for fast, safe student trades."
    >
      <h2 className="text-on-background text-xl font-extrabold mb-3">What makes VLX different?</h2>
      <ul className="list-disc pl-5 mb-6">
        <li><b>Verified students only</b> (college email verification)</li>
        <li><b>Campus-relevant items</b> (books, electronics, cycles, essentials)</li>
        <li><b>Local meetups</b> (quick exchange, no shipping)</li>
        <li><b>Basic moderation</b> (reports + admin review)</li>
      </ul>

      <h2 className="text-on-background text-xl font-extrabold mb-3">How a trade works</h2>
      <ol className="list-decimal pl-5 mb-6">
        <li>Seller posts a listing with photos and price</li>
        <li>Buyer contacts the seller (WhatsApp)</li>
        <li>Meet on campus, inspect item, pay safely</li>
        <li>Seller marks listing as sold</li>
      </ol>

      <h2 className="text-on-background text-xl font-extrabold mb-3">Safety tips</h2>
      <p>
        Meet in public areas, verify payments before handover, and use the report option for suspicious listings.
      </p>
    </InfoPage>
  );
};

export default LearnMore;

