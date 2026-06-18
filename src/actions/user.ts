'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUser(data: {
  name?: string;
  university?: string;
  studentId?: string;
  phone?: string;
}) {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Not authenticated");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.university !== undefined && { university: data.university }),
      ...(data.studentId !== undefined && { studentId: data.studentId }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
  });

  revalidatePath("/profile");
}