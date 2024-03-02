import { PrismaClient } from '@prisma/client';
import { MemberId } from './memeberId.js';

async function loadMemberTypes(memberIds: string[], prisma: PrismaClient) {
    const memberTypes = await prisma.memberType.findMany({
        where: { id: { in: memberIds } },
      });
      return memberTypes;
}
