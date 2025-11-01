import React from 'react'

export default function Contact() {
  return (
    <section className="page contact">
      <h1>Contactez-nous</h1>
      <p>Vous avez une question ? Notre équipe est à votre écoute.</p>
      <form className="contact-form">
        <input type="text" placeholder="Votre nom" required />
        <input type="email" placeholder="Votre e-mail" required />
        <textarea placeholder="Votre message..." rows="5" required></textarea>
        <button type="submit">Envoyer</button>
      </form>
    </section>
  )
}

