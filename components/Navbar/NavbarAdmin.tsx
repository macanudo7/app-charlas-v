import styles from './Navbar.module.css'
import Link from 'next/link'
import Image from 'next/image'

export default function NavbarAdmin() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Image
          src="/img/logo-yura.png"
          alt="Logo de Yura"
          width={150}
          height={50}
        />
      </div>

      <ul className={styles.menu}>
        <li>
          <Link href="/">Inicio</Link>
        </li>

        <li>
          <Link href="/charlas">Charlas</Link>
        </li>

        <li>
          <Link href="/usuarios">Usuarios</Link>
        </li>
      </ul>
    </nav>
  )
}