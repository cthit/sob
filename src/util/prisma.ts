import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const getUserFromDatabase = async (slackID: string) => {
	return await prisma.user.findUnique({
		where: {
			sid: slackID
		}
	});
};

export const createUser = async (userSlackID: string, userCID: string) => {
	return await prisma.user.create({
		data: {
			cid: userCID,
			sid: userSlackID
		}
	});
};
