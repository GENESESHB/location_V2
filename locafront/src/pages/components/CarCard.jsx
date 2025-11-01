export default function CarCard({ car }) {
  // car = { id, name, imageUrl, rating, reviewsCount, priceMAD, tag }
  return (
    <article className="cardX">
      <div className="cardX-media">
        <img src={car.imageUrl} alt={car.name} loading="lazy" />
        {car.tag && <span className="cardX-badge">{car.tag}</span>}
      </div>

      <div className="cardX-body">
        <h3 className="cardX-title">{car.name}</h3>

        <div className="cardX-rating">
          <span className="rate-bubble">{car.rating?.toFixed?.(1) ?? '—'}</span>
          <span className="muted">{car.reviewsCount ?? 0} avis</span>
        </div>

        <div className="cardX-bottom">
          <div className="price">
            <div className="muted">Par jour</div>
            <div><strong>MAD {car.priceMAD}</strong></div>
          </div>
          <button className="cta-link">Obtenir le tarif</button>
        </div>
      </div>
    </article>
  );
}

