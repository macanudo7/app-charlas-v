import NavbarLogin from '@/components/Navbar/NavbarLogin'


export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarLogin />

      {children}



    </>
  )
}