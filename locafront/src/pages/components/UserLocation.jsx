import React, { useEffect, useState } from "react";

export default function UserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("https://locationvoiture-cbdj.vercel.app/whoami/place");
        if (!res.ok) throw new Error("Failed to fetch location");
        const data = await res.json();
        setLocation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, []);

  if (loading) return <p>Loading location…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  const displayName = location?.place?.display_name;
  const city = location?.geolocation?.city;
  const country = location?.geolocation?.country_name;

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>🌍 Your Location Info</h2>
      <p><strong>IP:</strong> {location?.ip}</p>
      {displayName ? (
        <p><strong>Place:</strong> {displayName}</p>
      ) : (
        <p><strong>City, Country:</strong> {city}, {country}</p>
      )}
    </div>
  );
}
