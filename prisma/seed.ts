import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createNewUserTriggers(columns: { [name: string]: string }) {
    const queries = [
        `
            CREATE OR REPLACE FUNCTION onAuthNewUser()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = ''
            AS $$
            BEGIN
                INSERT INTO public.UserProfile (${Object.keys(columns).join(', ')})
                VALUES (${Object.values(columns).join(', ')});

                -- update default data from auth.users
                UPDATE public.UserProfile SET
                    name = COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
                    email = COALESCE(new.email, '')
                    WHERE id = new.id;

                -- set custom claims
                UPDATE auth.users
                SET  raw_app_meta_data = jsonb_set(
                    COALESCE(raw_app_meta_data, '{}'::jsonb),
                    '{custom_claims}',
                    '{"is_whitelisted": false, "role": "BASE", "type": "STUDENT"}',
                    true
                ) WHERE id = new.id;

                RETURN NEW;
            END;
            $$;
        `,
        `
            CREATE OR REPLACE TRIGGER on_auth_new_user
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE PROCEDURE onAuthNewUser();
        `,
        `
            CREATE OR REPLACE FUNCTION onUserUpdated()
            RETURNS trigger
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
                        'is_whitelisted', NEW.is_whitelisted,
                        'role', NEW.role,
                        'type', NEW.type
                    )::jsonb,
                    true
                ) WHERE id = NEW.id;
                RETURN NEW;
            END;
            $$;
        `,
        `
            -- update custom claims on userprofile.{is_whitelisted|role|type} update
            CREATE OR REPLACE TRIGGER on_user_update
                AFTER UPDATE OF is_whitelisted, role, type ON public.UserProfile
                FOR EACH ROW
                WHEN (
                    OLD.is_whitelisted IS DISTINCT FROM NEW.is_whitelisted OR
                    OLD.role IS DISTINCT FROM NEW.role OR
                    OLD.type IS DISTINCT FROM NEW.type
                ) EXECUTE PROCEDURE onUserUpdated();
        `,
    ];

    await prisma.$transaction(
        queries.map(query => prisma.$executeRawUnsafe(query)),
    );
}

async function createDeleteUserTriggers() {
    const queries = [
        `
            CREATE OR REPLACE FUNCTION onAuthDeleteUser()
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
        `
            CREATE OR REPLACE TRIGGER on_auth_delete_user
                AFTER DELETE ON auth.users
                FOR EACH ROW EXECUTE PROCEDURE onAuthDeleteUser();
        `,
    ]

    await prisma.$transaction(
        queries.map(query => prisma.$executeRawUnsafe(query)),
    );
}

async function newSemesterTriggers() {
    const queries = [
        `
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
        `
            CREATE OR REPLACE TRIGGER before_semester_insert
                BEFORE INSERT ON public.Semester
                FOR EACH ROW EXECUTE PROCEDURE generateSemesterId();
        `,
    ];

    await prisma.$transaction(
        queries.map(query => prisma.$executeRawUnsafe(query)),
    );
}

async function seedSemester() {
    const queries = [
        `INSERT INTO public.semester (year, type, is_active)
        VALUES
            (2025, 'SPRING', true),
            (2025, 'SUMMER', false),
            (2025, 'MONSOON', false),
            (2025, 'WINTER', false);
        `,
    ];

    await prisma.$transaction(
        queries.map(query => prisma.$executeRawUnsafe(query)),
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
        const course = await prisma.course.create({
            data: courseData
        });

        await prisma.courseSection.createMany({
            data: [
                { name: 'L1', courseId: course.id },
                { name: 'P1', courseId: course.id },
            ]
        });
    }
}

async function main() {
    await createNewUserTriggers({
        id: 'new.id',
        name: "''",
        email: "''",
        type: "'STUDENT'",
        role: "'BASE'",
        is_whitelisted: "false",
    })
        .then(() => console.log('✅ newUserTriggers created'))
        .catch((e) => console.error(`🚨 ${e}`));

    await createDeleteUserTriggers()
        .then(() => console.log('✅ deleteUserTriggers created'))
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
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });