function Header() {
  return (
    <header className="flex flex-wrap justify-between items-start gap-4">
      <div className="text-white max-w-xl">
        <h1 className="text-7xl leading-tight">
          Olá,<br />
          <small className="text-4xl font-bold">Seja bem-vindo</small>
        </h1>
        <p className="mt-4 text-4xl opacity-90">
          Utilize o nosso totem interativo para conhecer os serviços do Comfort Mogi Guaçu e da nossa cidade.
        </p>
      </div>
      <div className="flex justify-end items-end w-full nl md:w-auto">
        <img src="/images-removebg-preview (2) (1).png" alt="Logo Comfort Hotel" className="w-48" />
      </div>
    </header>
  );
}

export default Header;