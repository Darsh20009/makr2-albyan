import { Redirect, useSearch } from "wouter";

export default function DonationSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const donationId = params.get("id") || params.get("donationId") || params.get("orderId");

  if (!donationId) {
    return <Redirect to="/donate" />;
  }

  return <Redirect to={`/payment-result?id=${encodeURIComponent(donationId)}`} />;
}
