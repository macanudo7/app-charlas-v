import NavbarAdmin from '@/components/Navbar/NavbarAdmin'


export default function CharlaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarAdmin />

      {children}



    </>
  )
}