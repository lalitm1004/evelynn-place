import { PrismaClient, Prisma, CourseSectionType } from "@prisma/client";

const db = new PrismaClient();

async function createUserTriggers() {
  const queries = [
    Prisma.sql`
            CREATE OR REPLACE FUNCTION fnOnAuthNewUser()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = ''
            AS $$
            BEGIN
                INSERT INTO public.UserProfile (id, name, email)
                VALUES (new.id, '', '');

                -- update default data
                UPDATE public.UserProfile SET
                    name = COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
                    email = COALESCE(new.email, '')
                WHERE id = new.id;

                -- update custom claims
                UPDATE auth.users SET
                    raw_app_meta_data = jsonb_set(
                        COALESCE(raw_app_meta_data, '{}'::jsonb),
                        '{custom_claims}',
                        '{"type": "BASE", "is_whitelisted": false}',
                        true
                    ) WHERE id = new.id;

                RETURN NEW;
            END;
            $$;
        `,
    Prisma.sql`
            CREATE OR REPLACE TRIGGER trOnAuthNewUser
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE PROCEDURE fnOnAuthNewUser();
        `,
    Prisma.sql`
            CREATE OR REPLACE FUNCTION fnOnUserUpdate()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = ''
            AS $$
            BEGIN
                UPDATE auth.users
                SET raw_app_meta_data = jsonb_set(
                    COALESCE(raw_app_meta_data, '{}'::jsonb),
                    '{custom_claims}',
                    json_build_object(
                        'type', NEW.type,
                        'is_whitelisted', NEW.is_whitelisted
                    )::jsonb,
                    true
                ) WHERE id = NEW.id;

                RETURN NEW;
            END;
            $$;
        `,
    Prisma.sql`
            CREATE OR REPLACE TRIGGER trOnUserUpdate
                AFTER UPDATE OF type ON public.UserProfile
                FOR EACH ROW
                WHEN (
                    OLD.type IS DISTINCT FROM NEW.type OR
                    OLD.is_whitelisted IS DISTINCT FROM NEW.is_whitelisted
                ) EXECUTE PROCEDURE fnOnUserUpdate();
        `,
    Prisma.sql`
            CREATE OR REPLACE FUNCTION fnOnAuthDeleteUser()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = ''
            AS $$
            BEGIN
                DELETE FROM public.UserProfile WHERE id = old.id;
                RETURN old;
            END;
            $$;
        `,
    Prisma.sql`
            CREATE OR REPLACE TRIGGER trOnAuthDeleteUser
                AFTER DELETE ON auth.users
                FOR EACH ROW EXECUTE PROCEDURE fnOnAuthDeleteUser();
        `,
  ];

  for (const query of queries) {
    try {
      await db.$executeRaw(query);
    } catch (e) {
      console.error(`Error with query ${query} > ${e}`)
    }
  }
}

async function newSemesterTriggers() {
  const queries = [
    Prisma.sql`
            CREATE OR REPLACE FUNCTION generateSemesterId()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = ''
            AS $$
            DECLARE
                semester_prefix VARCHAR(2);
            BEGIN
                semester_prefix := CASE NEW.type
                    WHEN 'SPRING' THEN 'sp'
                    WHEN 'SUMMER' THEN 'su'
                    WHEN 'MONSOON' THEN 'mo'
                    WHEN 'WINTER' THEN 'wi'
                END;

                NEW.id := semester_prefix || NEW.year;
                RETURN NEW;
            END;
            $$;
        `,
    Prisma.sql`
            CREATE OR REPLACE TRIGGER before_semester_insert
                BEFORE INSERT ON public.Semester
                FOR EACH ROW EXECUTE PROCEDURE generateSemesterId();
        `,
  ];

  for (const query of queries) {
    try {
      await db.$executeRaw(query);
    } catch (e) {
      console.error(`Error with query ${query} > ${e}`)
    }
  }

}

async function seedSemester() {
  const queries = [
    Prisma.sql`
        INSERT INTO public.semester (year, type, is_active)
        VALUES
            (2025, 'SPRING', true),
            (2025, 'SUMMER', false),
            (2025, 'MONSOON', false),
            (2025, 'WINTER', false);
        `,
  ];

  await db.$transaction(
    queries.map(query => db.$executeRaw(query)),
  )
}

async function seedCourse() {
  const courses = [
    { code: 'ENG450', title: 'AI in Fiction and Film', semesterId: 'sp2025' },
    { code: 'CSD204', title: 'Operating Systems', semesterId: 'sp2025' },
    { code: 'CSD210', title: 'Probability and Statistics', semesterId: 'sp2025' },
    { code: 'CSD212', title: 'Digital Image Processing', semesterId: 'sp2025' },
    { code: 'CSD317', title: 'Intro to Database Systems', semesterId: 'sp2025' },
    { code: 'MAT161', title: 'Linear Algebra', semesterId: 'sp2025' },
    { code: 'PHY101', title: 'Intro to Physics I', semesterId: 'sp2025' },
  ];

  for (const courseData of courses) {
    const course = await db.course.create({
      data: courseData
    });

    await db.courseSection.createMany({
      data: [
        { name: 'L1', courseId: course.id, type: CourseSectionType.LECTURE },
        { name: 'P1', courseId: course.id, type: CourseSectionType.PRACTICAL },
      ]
    });
  }
}

async function main() {
  await createUserTriggers()
    .then(() => console.log('✅ userTriggers created'))
    .catch((e) => console.error(`🚨 ${e}`));

  await newSemesterTriggers()
    .then(() => console.log('✅ newSemesterTriggers created'))
    .catch((e) => console.error(`🚨 ${e}`));

  await seedSemester()
    .then(() => console.log('✅ public.semester seeded'))
    .catch((e) => console.error(`🚨 ${e}`));

  await seedCourse()
    .then(() => console.log('✅ public.course seeded'))
    .catch((e) => console.error(`🚨 ${e}`));
}


main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
