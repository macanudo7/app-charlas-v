import Navbar from '@/components/Navbar/Navbar'


export default function OrgulloMaestroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />

      {children}



    </>
  )
}