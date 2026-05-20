import styles from './FormCharla.module.css'

export default function FormCharla() {
    return (
        <div className={styles.formCharla}>
            <form className="w-full max-w-3xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">

                    <div className="flex flex-col pt-2 col-span-3">
                        <label htmlFor="dni" className="mb-2 text-sm">
                            DNI <span>*</span>
                        </label>

                        <input
                            id="dni"
                            name="dni"
                            type="text"
                            maxLength={8}
                            inputMode="numeric"
                            pattern="[0-9]{8}"
                            placeholder="Ingrese su DNI"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col pt-2 col-span-3">
                        <label htmlFor="empresa" className="mb-2 text-sm">
                            Empresa / institución <span>*</span>
                        </label>

                        <input
                            id="empresa"
                            name="empresa"
                            type="text"
                            placeholder="Ingrese su empresa o institución"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col col-span-6 pt-2">
                        <label htmlFor="nombre" className="mb-2 text-sm">
                            Nombres y apellidos <span>*</span>
                        </label>

                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="Ingrese sus nombres y apellidos"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col col-span-3 pt-2">
                        <label htmlFor="correo" className="mb-2 text-sm">
                            Correo electrónico <span>*</span>
                        </label>

                        <input
                            id="correo"
                            name="correo"
                            type="email"
                            placeholder="Ingrese su correo electrónico"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col col-span-3 pt-2">
                        <label htmlFor="celular" className="mb-2 text-sm">
                            Celular <span>*</span>
                        </label>

                        <input
                            id="celular"
                            name="celular"
                            type="text"
                            maxLength={9}
                            inputMode="numeric"
                            pattern="[0-9]{9}"
                            placeholder="Ingrese su celular"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col pt-2 col-span-2">
                        <label htmlFor="departamento" className="mb-2 text-sm">
                            Departamento <span>*</span>
                        </label>

                        <input
                            id="departamento"
                            name="departamento"
                            type="text"
                            placeholder="Ingrese su departamento"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col pt-2 col-span-2">
                        <label htmlFor="provincia" className="mb-2 text-sm">
                            Provincia <span>*</span>
                        </label>

                        <input
                            id="provincia"
                            name="provincia"
                            type="text"
                            placeholder="Ingrese su provincia"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="flex flex-col pt-2 col-span-2">
                        <label htmlFor="distrito" className="mb-2 text-sm">
                            Distrito <span>*</span>
                        </label>

                        <input
                            id="distrito"
                            name="distrito"
                            type="text"
                            placeholder="Ingrese su distrito"
                            className="h-12 px-4 border border-gray-300 outline-none transition focus:border-black"
                        />
                    </div>

                    <div className="mt-8">

                        <button
                            type="submit"
                            className="h-12 px-12 text-white transition"
                        >
                            Enviar
                        </button>

                    </div>


                </div>

            </form>
        </div>
    )
}