export default function About() {
  return (
    <section className="container-page py-16 max-w-3xl">
      <span className="eyebrow">03 — About</span>
      <h1 className="text-[clamp(32px,5vw,50px)] mt-3">About S.M. Autos</h1>
      <p className="text-chrome-light mt-4">
        S.M. Autos is a neighborhood motorcycle showroom offering sales, service, parts and
        honest advice. This project is a full-stack rebuild of the original static showroom
        site — React on the frontend, a Node/Express API backed by Neon Postgres, JWT-secured
        admin access, and a live catalog you can manage yourself.
      </p>
    </section>
  );
}
