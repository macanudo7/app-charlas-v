import styles from './Navbar.module.css'
import Image from 'next/image'

export default function NavbarLogin() {
  return (
    <nav className={styles.navbar + " " + styles.navbarLogin}>
      <div className={styles.navbarContainer + " max-w-7xl mx-auto px-4 w-full"}>
        <div className={styles.logo}>
          <Image
            src="/img/logo-yura.png"
            alt="Logo de Yura"
            width={150}
            height={50}
          />
        </div>

        <ul className={styles.menu}>
          
        </ul>
      </div>
    </nav>
  )
}