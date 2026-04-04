import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-forge border-t border-acier/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl tracking-widest text-calcaire">
                S.E<span className="text-or ml-2">GARAGE</span>
              </span>
            </Link>
            <p className="font-body text-acier text-sm leading-relaxed mb-4">
              Carrosserie · Mécanique · Pare-brise · Pièces détachées
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-or">
              Prix bas toute l'année
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-or mb-6">Navigation</h3>
            <nav className="space-y-3">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'Nos Services', to: '/services' },
                { label: 'À Propos', to: '/a-propos' },
                { label: 'Contact', to: '/contact' },
                { label: 'Prendre RDV', to: '/rendez-vous' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block font-body text-sm text-acier hover:text-calcaire transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-or mb-6">Nous trouver</h3>
            <div className="space-y-4">
              <a href="tel:0622133447" className="flex items-center gap-3 group">
                <Phone size={16} className="text-or flex-shrink-0" />
                <span className="font-display text-xl tracking-wider text-calcaire group-hover:text-or transition-colors duration-200">
                  06 22 13 34 47
                </span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-or flex-shrink-0 mt-0.5" />
                <address className="font-body text-sm text-acier not-italic leading-relaxed">
                  13 Avenue de la Gare<br />92230 Gennevilliers
                </address>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-or flex-shrink-0 mt-0.5" />
                <div className="font-body text-sm text-acier leading-relaxed">
                  <p>Lun–Ven : 8h00–19h00</p>
                  <p>Sam : 9h00–17h00</p>
                  <p>Dim : Fermé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-acier/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-mono text-xs text-acier/60 tracking-wide">
            © {year} S.E Garage — Gennevilliers. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-mono text-xs text-acier/60 hover:text-acier transition-colors">Mentions légales</a>
            <a href="#" className="font-mono text-xs text-acier/60 hover:text-acier transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
