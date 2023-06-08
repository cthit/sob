import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

export const prismaGetUser = async (identifier: string) => {
	return await prisma.user.findFirst({
		where: {
			OR: [{ slackId: identifier }, { cid: identifier }]
		}
	});
};

export const prismaCreateUser = async (userSlackID: string, userCID: string) => {
	return await prisma.user.create({
		data: {
			cid: userCID,
			slackId: userSlackID
		}
	});
};

export const prismaCreateGroup = async (handle: string, slackId: string, gammaName: string) => {
	return await prisma.group.create({
		data: {
			handle,
			slackId,
			gammaName
		}
	});
};

export const prismaGetGroup = async (identifier: string) => {
	return await prisma.group.findFirst({
		where: {
			OR: [{ handle: identifier }, { slackId: identifier }, { gammaName: identifier }]
		}
	});
};

export const prismaGetSubgroups = async (superGroup: string) => {
	return await prisma.group.findMany({
		where: {
			gammaName: {
				startsWith: superGroup
			}
		}
	});
};

export const prismaUpdateGroupHandle = async (gammaName: string, newHandle: string) => {
	return await prisma.group.update({
		where: {
			handle: gammaName
		},
		data: {
			handle: newHandle
		}
	});
};

export const prismaDisconnect = () => {
	return prisma.$disconnect();
};
