'use client'

import styles from './Navbar.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react';

export default function NavbarAdmin() {
  return (
    <nav className={styles.navbar + " " + styles.navbarAdmin}>
      <div className={styles.navbarContainer + " max-w-7xl mx-auto px-4 w-full flex justify-between items-center"}>
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
            <Link href="/admin" className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32" fill="none">
                <path d="M5 0C2.79375 0 1 1.79375 1 4V28C1 30.2062 2.79375 32 5 32H21C23.2062 32 25 30.2062 25 28V10H17C15.8937 10 15 9.10625 15 8V0H5ZM17 0V8H25L17 0ZM8 16H18C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18H8C7.45 18 7 17.55 7 17C7 16.45 7.45 16 8 16ZM8 20H18C18.55 20 19 20.45 19 21C19 21.55 18.55 22 18 22H8C7.45 22 7 21.55 7 21C7 20.45 7.45 20 8 20ZM8 24H18C18.55 24 19 24.45 19 25C19 25.55 18.55 26 18 26H8C7.45 26 7 25.55 7 25C7 24.45 7.45 24 8 24Z" fill="#01FFFF" />
              </svg>
              <span>Eventos</span>
            </Link>
          </li>

          <li>
            <Link href="/admin/participantes" className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32" fill="none">
                <g clipPath="url(#clip0_2078_8)">
                  <path d="M14 16C16.1217 16 18.1566 15.1571 19.6569 13.6569C21.1571 12.1566 22 10.1217 22 8C22 5.87827 21.1571 3.84344 19.6569 2.34315C18.1566 0.842855 16.1217 0 14 0C11.8783 0 9.84344 0.842855 8.34315 2.34315C6.84285 3.84344 6 5.87827 6 8C6 10.1217 6.84285 12.1566 8.34315 13.6569C9.84344 15.1571 11.8783 16 14 16ZM11.1438 19C4.9875 19 0 23.9875 0 30.1437C0 31.1687 0.83125 32 1.85625 32H26.1437C27.1687 32 28 31.1687 28 30.1437C28 23.9875 23.0125 19 16.8563 19H11.1438Z" fill="#01FFFF" />
                </g>
                <defs>
                  <clipPath id="clip0_2078_8">
                    <rect width="28" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span>Participantes</span>
            </Link>
          </li>

          <li>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex flex-col items-center" type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M23.6187 6.61875L31.2938 14.2937C31.7438 14.7437 32 15.3625 32 16C32 16.6375 31.7438 17.2562 31.2938 17.7062L23.6187 25.3813C23.2187 25.7813 22.6812 26 22.1187 26C20.95 26 20 25.05 20 23.8813V20H12C10.8937 20 10 19.1063 10 18V14C10 12.8937 10.8937 12 12 12H20V8.11875C20 6.95 20.95 6 22.1187 6C22.6812 6 23.2187 6.225 23.6187 6.61875ZM10 6H6C4.89375 6 4 6.89375 4 8V24C4 25.1063 4.89375 26 6 26H10C11.1063 26 12 26.8937 12 28C12 29.1063 11.1063 30 10 30H6C2.6875 30 0 27.3125 0 24V8C0 4.6875 2.6875 2 6 2H10C11.1063 2 12 2.89375 12 4C12 5.10625 11.1063 6 10 6Z" fill="#01FFFF"/>
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>

      </div>

    </nav>
  )
}