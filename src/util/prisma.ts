import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const prismaGetUser = async (identifier: string) => {
	return await prisma.user.findFirst({
		where: {
			OR: [{ sid: identifier }, { cid: identifier }]
		}
	});
};

export const prismaCreateUser = async (
	userSlackID: string,
	userCID: string
) => {
	return await prisma.user.create({
		data: {
			cid: userCID,
			sid: userSlackID
		}
	});
};

export const prismaCreateGroup = async (name: string, sid: string) => {
	return await prisma.group.create({
		data: {
			sid,
			name
		}
	});
};

export const prismaGetGroup = async (identifier: string) => {
	return await prisma.group.findFirst({
		where: {
			OR: [{ sid: identifier }, { name: identifier }]
		}
	});
};

export const prismaGetSubgroups = async (superGroup: string) => {
	return await prisma.group.findMany({
		where: {
			name: {
				startsWith: superGroup
			}
		}
	});
};

export const prismaDisconnect = () => {
	return prisma.$disconnect();
};
