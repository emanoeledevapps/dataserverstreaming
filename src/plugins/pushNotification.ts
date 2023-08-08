import { prisma } from "../lib/prisma";

interface NotificationProps{
    for: string[];
    from?: string;
    type: string;
    data: string;
}

export async function pushNotification({for: to, from, type, data}: NotificationProps){
    for(var i = 0; i < to.length; i++){
        if(to[i] !== from?.toUpperCase()){
            await prisma.notification.create({
                data:{
                    for: to[i],
                    from: from?.toUpperCase(),
                    type,
                    data
                }
            })
        }
    }
}