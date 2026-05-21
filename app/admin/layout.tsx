import NavbarAdmin from '@/components/Navbar/NavbarAdmin'


export default function AdminLayout({
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