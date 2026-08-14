class NouFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="footer-content">
                <div class="newsletter-section-footer">
                    <div>
                        <p>¡Suscríbete! y sé de los primeros en enterarte de nuestros lanzamientos</p>
                    </div>
                    <form class="newsletter-form ajax-form" action="https://formspree.io/f/xbdnpazj" method="POST">
                        <input type="email" name="email" placeholder="Tu correo electrónico" required>
                        <button type="submit">Suscribirme</button>
                    </form>
                    <div class="form-success-msg">
                        ¡Gracias por suscribirte! Te mantendremos al tanto.
                    </div>
                </div>

                <div class="social-links">
                    <a href="https://instagram.com/somos.nou" target="_blank" rel="noopener noreferrer">
                        <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://tiktok.com/@somos.nou" target="_blank" rel="noopener noreferrer">
                        <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                        </svg>
                    </a>
                </div>

                <div class="brand">
                    <p class="copyright">©2026 NOU</p>
                    <p>Tu web para vestir exclusividad en algodón 100%</p>
                </div>
            </div>
        </footer>
        `;
    }
}
customElements.define('nou-footer', NouFooter);