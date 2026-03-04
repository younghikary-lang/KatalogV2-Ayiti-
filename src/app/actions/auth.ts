"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { linkGuestOrders } from "./order";

export async function registerUser(formData: FormData) {
    try {
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const email = formData.get("email") as string;
        const whatsapp = formData.get("whatsapp") as string;
        const password = formData.get("password") as string;

        if (!whatsapp || !password || !firstName) {
            return { success: false, error: "Missing required fields" };
        }

        // Check unique constraints
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber: whatsapp },
                    ...(email ? [{ email }] : [])
                ]
            }
        });

        if (existingUser) {
            return { success: false, error: "errorAuth" }; // Trigger i18n error
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${firstName} ${lastName}`.trim();

        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                phoneNumber: whatsapp,
                email: email || null,
                password: hashedPassword,
                role: "CLIENT",
            }
        });

        // 🔗 LINK GUEST ORDERS (Step A Strategy)
        await linkGuestOrders(newUser.id, whatsapp);

        return { success: true };
    } catch (error) {
        console.error("Registration failed:", error);
        return { success: false, error: "Registration failed." };
    }
}
