import Header from "../../components/Header";

function Login() {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#171923]">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] items-center justify-center px-5 py-10">
        <section className="w-full max-w-[620px] rounded-xl border border-[#e4e6ed] bg-white px-6 py-8 text-center shadow-[0_2px_12px_rgba(20,20,40,0.04)] sm:px-10">
          <h1 className="text-[22px] font-bold tracking-[-0.4px]">
            Login
          </h1>
          <p className="mt-2 text-[12px] leading-5 text-[#777b86]">
            Login will be available here.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;
