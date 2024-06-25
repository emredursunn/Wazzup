export type User = {
    userId: string,
    name: string,
    avatar: string,
    phone: number,
    status?: string,
    chats?: any,
    friends?: string[]
    stories?:string[]
}

export type Chat = {
    chatId: string,
    fromUserId: string,
    toUserId: string,
    lastMessage: string,
    messageList: Message[]
}

export type Message = {
    messageId: string,
    fromUserId: string,
    content: string,
    sentTime: string,
    type: string
    duration?: string
}

export type Story = {
    storyId:string
    userId: string,
    uri: string,
    uploadTime:string
}
