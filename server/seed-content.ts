import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

async function seedContent() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required to seed Al-Bayan content.");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  try {
    const db = client.db();
    const contents = [
      {
        slug: "about",
        title: "عن جمعية مقارئ البيان",
        titleEn: "About Al-Bayan",
        content: `
          <h2>جمعية مقارئ البيان لتعليم القرآن الكريم للناطقين بغير العربية</h2>
          <p>جمعية أهلية مقرها الرياض، مرخصة برقم <strong>1000863300</strong>، ورقم قرار التسجيل <strong>ED048385</strong>.</p>
          <p>تعنى الجمعية بتعليم القرآن الكريم للناطقين بغير العربية، وبناء مسارات تعليمية تعين الدارسين على التلاوة الصحيحة والحفظ والمراجعة.</p>
        `,
      },
      {
        slug: "goals",
        title: "برامجنا التعليمية",
        titleEn: "Our Programs",
        content: `
          <h2>مسارات تعليم القرآن الكريم</h2>
          <ul>
            <li>تصحيح الفاتحة والتلاوة.</li>
            <li>حفظ القرآن الكريم ومراجعته.</li>
            <li>تعليم أحكام التجويد والقراءات.</li>
          </ul>
          <p>تُعلن مواعيد الالتحاق والتفاصيل عبر قنوات الجمعية المعتمدة.</p>
        `,
      },
      {
        slug: "vision",
        title: "رؤيتنا ورسالتنا",
        titleEn: "Vision & Mission",
        content: `
          <h2>رسالتنا</h2>
          <p>تعليم القرآن الكريم للناطقين بغير العربية، والإسهام في بناء جيل يتلو كتاب الله ويتعلمه ويعمل به.</p>
          <h2>أثرنا التعليمي المعلن</h2>
          <ul>
            <li>3,287 دارساً ودارسة.</li>
            <li>87 معلماً ومعلمة.</li>
            <li>دارسون من أكثر من 28 دولة.</li>
          </ul>
          <p>هذه أرقام منشورة في مواد الجمعية التعريفية، وليست أرقاماً لحظية.</p>
        `,
      },
      {
        slug: "founders",
        title: "حوكمة الجمعية",
        titleEn: "Association Governance",
        content: "<p>تُنشر بيانات الحوكمة وأعضاء الجمعية بعد اعتمادها رسمياً.</p>",
      },
      {
        slug: "founders-legacy",
        title: "وثائق الجمعية",
        titleEn: "Association Documents",
        content: "<p>تتوفر الوثائق الرسمية المعتمدة في صفحة الإفصاح.</p>",
      },
      {
        slug: "board",
        title: "مجلس الإدارة",
        titleEn: "Board of Directors",
        content: "<p>تُنشر أسماء أعضاء مجلس الإدارة بعد اعتمادها رسمياً.</p>",
      },
      {
        slug: "bylaws",
        title: "اللائحة الأساسية",
        titleEn: "Bylaws",
        content: "<p>تُنشر اللائحة الأساسية المعتمدة في صفحة الإفصاح.</p>",
      },
    ];

    for (const content of contents) {
      await db.collection("content").updateOne(
        { slug: content.slug },
        {
          $set: {
            ...content,
            isPublished: true,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    const roles = [
      { name: "admin", nameAr: "مدير النظام", permissions: ["all"] },
      { name: "accountant", nameAr: "محاسب", permissions: ["donations", "reports", "transfers"] },
      { name: "delivery", nameAr: "مندوب توصيل", permissions: ["delivery_orders"] },
      { name: "user", nameAr: "مستخدم", permissions: ["donate", "profile"] },
    ];

    for (const role of roles) {
      await db.collection("roles").updateOne(
        { name: role.name },
        { $set: { ...role, createdAt: new Date() } },
        { upsert: true },
      );
    }

    console.log("Al-Bayan content seeded successfully. Legacy bank records were left unchanged and unapproved.");
  } finally {
    await client.close();
  }
}

seedContent().catch((error) => {
  console.error("Failed to seed Al-Bayan content:", error);
  process.exitCode = 1;
});
