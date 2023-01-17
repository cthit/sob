import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const prismaGetUser = async (slackID: string) => {
	return await prisma.user.findUnique({
		where: {
			sid: slackID
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

export const prismaDisconnect = () => {
	return prisma.$disconnect();
};
