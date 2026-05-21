import NavbarCliente from '@/components/Navbar/Navbar'


export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarCliente />

      {children}



    </>
  )
}