const materials = [
  {
    src: "/images/posters/phase-two-enrollment.jpg",
    alt: "ملصق برامج جمعية مقارئ البيان التعليمية",
    eyebrow: "برامج الجمعية",
    title: "مسارات قرآنية متعددة",
    note: "مادة تعريفية ببرامج التلاوة والحفظ وتصحيح الفاتحة.",
    imageClass: "aspect-[0.9/1] object-cover object-top",
  },
  {
    src: "/images/posters/enrollment-report.jpg",
    alt: "تقرير البرامج والحلقات القرآنية لجمعية مقارئ البيان",
    eyebrow: "من مواد الجمعية",
    title: "تقرير البرامج والحلقات",
    note: "اطّلع على المادة التعريفية الصادرة عن الجمعية.",
    imageClass: "aspect-[0.9/1] object-cover object-top",
  },
];

export function AssociationPostersSection() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 md:mb-14 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[.18em] text-[#a17d40]">من مواد الجمعية</p>
            <h2 className="text-3xl font-black leading-tight text-[#193c36] sm:text-4xl">لمحة من برامجنا</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#657970] md:text-base">
            مواد تعريفية من مقارئ البيان، تعرّفك على البرامج التعليمية والحلقات القرآنية.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 md:gap-7">
          {materials.map((item, index) => (
            <figure key={item.src} className={`poster-panel group overflow-hidden rounded-[1.75rem] border border-[#dfe4d9] bg-[#fbfaf4] ${index === 1 ? "md:mt-12" : ""}`}>
              <div className="grid min-h-[340px] grid-cols-[0.84fr_1fr] items-center gap-3 p-4 sm:gap-6 sm:p-6">
                <figcaption className="py-4">
                  <p className="text-[10px] font-bold tracking-[.16em] text-[#a17d40] sm:text-xs">{item.eyebrow}</p>
                  <h3 className="mt-3 text-xl font-black leading-snug text-[#193c36] sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-[#718179] sm:text-sm sm:leading-7">{item.note}</p>
                  <span className="mt-6 block h-px w-12 bg-[#c79b4b]" />
                </figcaption>
                <div className="relative overflow-hidden rounded-2xl bg-[#e8e9df] shadow-[0_12px_30px_rgba(25,60,54,.12)]">
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className={`w-full ${item.imageClass} transition-transform duration-700 group-hover:scale-[1.025]`}
                  />
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
