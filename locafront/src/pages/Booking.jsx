import React from 'react'

export default function Booking() {
  return (
    <section className="page booking">
      <h1>Réserver un service</h1>
      <p>
        Remplissez le formulaire ci-dessous pour réserver votre prochain voyage d’affaires avec WegoPro.
      </p>
      <form className="booking-form">
        <input type="text" placeholder="Nom complet" required />
        <input type="email" placeholder="Adresse e-mail" required />
        <input type="text" placeholder="Destination" required />
        <input type="date" required />
        <button type="submit">Confirmer la réservation</button>
      </form>
    </section>
  )
}

