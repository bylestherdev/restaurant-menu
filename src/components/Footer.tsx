'use client';

import { restaurantConfig } from '@/data/menu';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-amber-900 text-amber-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-2xl">
                🍽️
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{restaurantConfig.name}</h3>
                <p className="text-amber-300 text-sm">{restaurantConfig.description}</p>
              </div>
            </div>
            <p className="text-amber-400 text-sm max-w-md">
              Cocina tradicional con ingredientes de primera calidad y un toque de innovación.
              Ven a disfrutar de una experiencia gastronómica única.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Horario</h4>
            <div className="space-y-2 text-sm text-amber-300">
              <div className="flex justify-between">
                <span>Lunes - Jueves</span>
                <span>13:00 - 23:00</span>
              </div>
              <div className="flex justify-between">
                <span>Viernes - Sábado</span>
                <span>13:00 - 00:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo</span>
                <span>13:00 - 17:00</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <div className="space-y-2 text-sm text-amber-300">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>C/ Mayor 123, 28001 Madrid</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+34 900 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>info@lacasadelsabor.es</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-amber-500 text-sm">
              © {currentYear} {restaurantConfig.name}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-amber-500">
              <a href="#" className="hover:text-amber-300 transition-colors">Política de privacidad</a>
              <a href="#" className="hover:text-amber-300 transition-colors">Aviso legal</a>
              <a href="#" className="hover:text-amber-300 transition-colors">Alérgenos</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}