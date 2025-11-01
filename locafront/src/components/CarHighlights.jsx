export default function CarHighlights() {
  const items = [
    {
      icon: "https://cdn-icons-png.flaticon.com/512/201/201623.png",
      title: "Meilleures offres de voyage",
      text: "au Maroc",
      alt: "Médaille & avion",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
      title: "Des milliers d’offres de",
      text: "vols et d’hôtels",
      alt: "Billet & loupe",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/2331/2331970.png",
      title: "Plusieurs méthodes de",
      text: "paiement",
      alt: "Portefeuille",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/126/126509.png",
      title: "Assistance clientèle",
      text: "24h/24 et 7j/7",
      alt: "Casque support",
    },
  ];

  return (
    <section className="hi-plain" aria-label="Avantages">
      <ul className="hi-row">
        {items.map((it, i) => (
          <li key={i} className="hi-col">
            <img className="hi-img" src={it.icon} alt={it.alt} loading="lazy" />
            <p className="hi-title">{it.title}</p>
            <p className="hi-text">{it.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

