import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer + " max-w-7xl mx-auto px-4 w-full"}>
                <p>&copy; 2026 Yura - Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
