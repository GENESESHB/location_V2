import CarCard from './CarCard';

export default function CarList({ title = 'Voitures disponibles', cars = [] }) {
  return (
    <section className="wrap">
      <h2 className="section-title">{title}</h2>
      <div className="cards-grid">
        {cars.map((c) => <CarCard key={c.id} car={c} />)}
      </div>
    </section>
  );
}

