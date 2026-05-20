import styles from './Navbar.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className={styles.navbar + " " + styles.navbarClient}>
      <div className={styles.navbarContainer + " max-w-7xl mx-auto px-4 w-full flex justify-between items-center"}>
        <div className={styles.logo}>
          <Image
            src="/img/logo-yura.png"
            alt="Logo de Yura"
            width={150}
            height={50}
          />
        </div>

        <div className={styles.navbarBtn}>
          <a href="#formulario">INSCRIBIRSE AHORA</a>
        </div>
      </div>

    </nav>
  )
}