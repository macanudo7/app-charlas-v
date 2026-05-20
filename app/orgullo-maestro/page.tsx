import orgulloStyle from "@/app/orgullo-maestro/page.module.css";
import Image from 'next/image'
import FormCharla from "@/components/FormCharla/FormCharla";

export default function OrgulloMaestroPage() {
    return (
        <main className={`${orgulloStyle.orgulloPage} `}>
            <div className={`${orgulloStyle.orgulloBanner} flex items-center justify-center`}>
                <div className="relative mx-auto flex w-full flex-col space-y-1.5 p-4">
                    <div className="flex w-full items-center justify-center">
                        <Image
                            src="/img/bg-forms-yura.png"
                            alt="Orgullo Maestro Banner"
                            width={1000}
                            height={1000}
                            className="h-[75vh] w-auto object-contain"
                        />
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.5 19.6" preserveAspectRatio="none">
                    <path className="elementor-shape-fill" style={{ opacity: 0.33 }} d="M0 0L0 18.8 141.8 4.1 283.5 18.8 283.5 0z" />
                    <path className="elementor-shape-fill" style={{ opacity: 0.33 }} d="M0 0L0 12.6 141.8 4 283.5 12.6 283.5 0z" />
                    <path className="elementor-shape-fill" style={{ opacity: 0.33 }} d="M0 0L0 6.4 141.8 4 283.5 6.4 283.5 0z" />
                    <path className="elementor-shape-fill" d="M0 0L0 1.2 141.8 4 283.5 1.2 283.5 0z" />
                </svg>
            </div>

            <div className={`${orgulloStyle.orgulloForm} `}>
                <a className={`${orgulloStyle.orgulloGoTo} `} href="#formulario">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M535.1 342.6C547.6 330.1 547.6 309.8 535.1 297.3L375.1 137.3C362.6 124.8 342.3 124.8 329.8 137.3C317.3 149.8 317.3 170.1 329.8 182.6L467.2 320L329.9 457.4C317.4 469.9 317.4 490.2 329.9 502.7C342.4 515.2 362.7 515.2 375.2 502.7L535.2 342.7zM183.1 502.6L343.1 342.6C355.6 330.1 355.6 309.8 343.1 297.3L183.1 137.3C170.6 124.8 150.3 124.8 137.8 137.3C125.3 149.8 125.3 170.1 137.8 182.6L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7z" /></svg>
                </a>
                <div className="relative mx-auto flex w-full flex-col gap-4 p-4 max-w-7xl">
                    <div className=" p-3" id="formulario">
                        <div className={`${orgulloStyle.orgulloFormTitle} font-bold text-xl md:text-3xl pb-4 `}>
                            Acompáñenos en esta importante<br></br>capacitación del sector
                        </div>
                        <div className="pt-10">
                            <FormCharla />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${orgulloStyle.orgulloFooter} flex items-center justify-center `}>
                <div className="relative mx-auto flex w-full flex-col max-w-7xl p-4">
                    <div className="w-full p-3">
                        <div className={`${orgulloStyle.orgulloFooterTitle} font-bold text-2xl pb-4`}>
                            Organizado por:
                        </div>
                        <div className="flex items-center justify-start gap-4 mt-4 pt-4">
                            <Image
                                src="/img/logo-yura.png"
                                alt="Yura Logo"
                                width={200}
                                height={200}
                                className="h-auto w-full max-w-40 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}