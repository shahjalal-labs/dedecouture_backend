// import { WebSocket, WebSocketServer } from "ws";
// import { Request } from "express";
// import prisma from "../../../shared/prisma";
// import { verifyWebSocketToken } from "./socket.service";
// import { parse } from "url";
// import redisClient from "../../../helpers/redis";

// interface CustomWebSocket extends WebSocket {
//   userId?: string;
// }

// const roomUsers = new Map<string, Set<WebSocket>>();
// const groupUsers = new Map<string, Set<WebSocket>>();
// const connectedUsers = new Set<CustomWebSocket>();
// let wss;

// export function setupWebSocketServer(server: any) {
//   wss = new WebSocketServer({ server });

//   wss.on("connection", async (ws: CustomWebSocket, req: Request) => {
//     const { query } = parse(req.url!, true);
//     let authToken = req.headers["x-token"] as string;
//     if (!authToken && query["x-token"]) {
//       authToken = Array.isArray(query["x-token"])
//         ? query["x-token"][0]
//         : query["x-token"];
//     }
//     if (!authToken) {
//       console.log("No token provided — closing connection");
//       ws.close();
//       return;
//     }
//     const decoded = verifyWebSocketToken(ws, authToken);
//     if (!decoded) {
//       return;
//     }
//     const userId = decoded.id;
//     ws.userId = userId;
//     connectedUsers.add(ws);
//     // Save the socket for later
//     if (!roomUsers.has(userId)) roomUsers.set(userId, new Set());
//     roomUsers.get(userId)?.add(ws);
//     if (!groupUsers.has(userId)) groupUsers.set(userId, new Set());
//     groupUsers.get(userId)?.add(ws);

//     let roomId: string | null = null;   

//     const interval = setInterval(() => {
//       if (ws.readyState === WebSocket.OPEN) ws.ping();
//     }, 30000);

//     const conversations = await prisma.room.findMany({
//       where: {
//         OR: [{ user1Id: userId }, { user2Id: userId }],
//       },
//       orderBy: { updatedAt: "desc" },
//       include: {
//         user1: {
//           select: {
//             id: true,
//             userName: true,
//             profileImage: true,
//           },
//         },
//         user2: {
//           select: {
//             id: true,
//             userName: true,
//             profileImage: true,
//           },
//         },
//       },
//     });
//     const connectedUserIds = Array.from(connectedUsers)
//       .map((ws) => ws.userId)
//       .filter((id) => id !== undefined);

//     const formattedConversations = await Promise.all(
//       conversations.map(async (room) => {
//         const partner = room.user1Id === userId ? room.user2 : room.user1;
//         const isActive = connectedUserIds.includes(partner?.id as string);

//         const redisKey = `room:${room.id}:messages`;
//         const unreadKey = `room:${room.id}:unread:${userId}`;

//         const [redisRaw, unreadCountStr] = await Promise.all([
//           redisClient.lRange(redisKey, 0, -1),
//           redisClient.get(unreadKey),
//         ]);

//         const unreadCount = parseInt(unreadCountStr || "0", 30);
//         let latestMessage = null;

//         if (redisRaw.length > 0) {
//           const redisMessages = redisRaw.map((msg) => JSON.parse(msg));

//           // Sort by createdAt descending
//           redisMessages.sort(
//             (a, b) =>
//               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//           );

//           const latestRedisMsg = redisMessages[0];

//           latestMessage = {
//             content:
//               latestRedisMsg.content ??
//               (latestRedisMsg.fileUrl ? "sent file" : null),
//             createdAt: latestRedisMsg.createdAt,
//           };
//         }

//         return {
//           roomId: room.id,
//           partner: {
//             id: partner?.id,
//             userName: partner?.userName,
//             profileImage: partner?.profileImage,
//             isActive,
//           },
//           lastMessage: latestMessage,
//           unreadCount, // From Redis
//         };
//       })
//     );
//     ws.send(
//       JSON.stringify({
//         type: "member-conversation",
//         conversations: formattedConversations,
//       })
//     );

//     ws.on("message", async (message: any) => {
//       try {
//         const { type, receiverId, content, fileUrl, incomingGroupId } =
//           JSON.parse(message.toString());

//         const getConversationsForUser = async (targetUserId: string) => {
//           const rooms = await prisma.room.findMany({
//             where: {
//               OR: [{ user1Id: targetUserId }, { user2Id: targetUserId }],
//             },
//             orderBy: { updatedAt: "desc" },
//             include: {
//               user1: {
//                 select: {
//                   id: true,
//                   userName: true,
//                   profileImage: true,
//                 },
//               },
//               user2: {
//                 select: {
//                   id: true,
//                   userName: true,
//                   profileImage: true,
//                 },
//               },
//             },
//           });

//           return Promise.all(
//             rooms.map(async (room) => {
//               const partner =
//                 room.user1Id === targetUserId ? room.user2 : room.user1;
//               const isActive = connectedUserIds.includes(partner?.id as string);

//               const redisKey = `room:${room.id}:messages`;
//               const unreadKey = `room:${room.id}:unread:${targetUserId}`;

//               // Get the latest message from Redis
//               const buffered = await redisClient.lRange(redisKey, -1, -1);
//               const lastMessage =
//                 buffered.length > 0 ? JSON.parse(buffered[0]) : null;

//               // Get unread count from Redis (fallback to 0 if not found)
//               const unreadCountStr = await redisClient.get(unreadKey);
//               const unreadCount = parseInt(unreadCountStr || "0", 30);

//               // Determine content
//               const lastMessageContent =
//                 lastMessage?.content ||
//                 (lastMessage?.fileUrl?.length > 0 ? "sent file" : null);

//               return {
//                 roomId: room.id,
//                 partner: {
//                   id: partner?.id,
//                   userName: true,
//                   profileImage: partner?.profileImage,
//                   isActive,
//                 },
//                 lastMessage: lastMessage
//                   ? {
//                       content: lastMessageContent,
//                       createdAt: lastMessage?.createdAt || null,
//                     }
//                   : null,
//                 unreadCount,
//               };
//             })
//           );
//         };

//         switch (type) {
//           case "member-subscribe": {
//             if (!receiverId) {
//               return ws.send(
//                 JSON.stringify({
//                   type: "error",
//                   message: "receiverId is required",
//                 })
//               );
//             }

//             await prisma.user.findFirstOrThrow({
//               where:{id:receiverId}
//             })
//             // await prisma.user.findFirstOrThrow({
//             //   where:{id:userId}
//             // })

//             let room =
//               (await prisma.room.findFirst({
//                 where: {
//                   OR: [
//                     { user1Id: userId, user2Id: receiverId },
//                     { user1Id: receiverId, user2Id: userId },
//                   ],
//                 },
//               })) ||
//               (await prisma.room.create({
//                 data: { user1Id: userId, user2Id: receiverId },
//               }));

//             roomId = room.id;

//             const unreadKey = `room:${roomId}:unread:${userId}`;
//             await redisClient.set(unreadKey, "0");

//             roomUsers.forEach((clients, key) => {
//               if (clients.has(ws)) {
//                 clients.delete(ws);
//                 if (clients.size === 0) roomUsers.delete(key);
//               }
//             });

//             if (!roomUsers.has(roomId)) {
//               roomUsers.set(roomId, new Set());
//             }
//             roomUsers.get(roomId)?.add(ws);

//             const redisKey = `room:${roomId}:messages`;
//             const redisRaw = await redisClient.lRange(redisKey, -30, -1);
//             const messages = redisRaw.reverse().map((msg) => JSON.parse(msg));

//             ws.send(
//               JSON.stringify({
//                 type: "past-messages",
//                 roomId,
//                 messages: messages,
//               })
//             );

//             const senderConversations = await getConversationsForUser(userId);
//             ws.send(
//               JSON.stringify({
//                 type: "member-conversation",
//                 conversations: senderConversations,
//               })
//             );

//             break;
//           }

//           case "member-send-message": {
//             if (!roomId) {
//               return ws.send(
//                 JSON.stringify({
//                   type: "error",
//                   message: "You are not subscribed to any room",
//                 })
//               );
//             }

//             const roomInfo = await prisma.room.findUnique({
//               where: { id: roomId },
//               select: { user1Id: true, user2Id: true },
//             });

//             if (!roomInfo) {
//               return ws.send(
//                 JSON.stringify({
//                   type: "error",
//                   message: "Room not found",
//                 })
//               );
//             }

//             const messagePayload = {
//               content,
//               user1Id: userId,
//               user2Id: receiverId,
//               roomId,
//               fileUrl: fileUrl ?? [""],
//               createdAt: new Date().toISOString(),
//             };

//             const redisKey = `room:${roomId}:messages`;
//             await redisClient.rPush(redisKey, JSON.stringify(messagePayload));
//             const unreadKey = `room:${roomId}:unread:${receiverId}`;
//             await redisClient.incr(unreadKey);
//             const count = await redisClient.lLen(redisKey);

//             if (count >= 30) {
//               const messagesToSaveRaw = await redisClient.lRange(
//                 redisKey,
//                 0,
//                 14
//               );
//               const messagesToSave = messagesToSaveRaw.map((msg) =>
//                 JSON.parse(msg)
//               );

//               await prisma.message.createMany({ data: messagesToSave });

//               await redisClient.lTrim(redisKey, 15, -1);
//             }
//             await prisma.room.update({
//               where: {
//                 id: roomId,
//               },
//               data: {
//                 updatedAt: new Date(),
//               },
//             });

//             // Broadcast message to all room clients
//             roomUsers.get(roomId)?.forEach((client) => {
//               if (client.readyState === WebSocket.OPEN) {
//                 client.send(
//                   JSON.stringify({
//                     type: "member-new-message",
//                     message: messagePayload,
//                     roomId,
//                   })
//                 );
//               }
//             });

//             // Send updated conversation list to receiver (if online)
//             const target = Array.from(connectedUsers).find(
//               (client) => client.userId === receiverId
//             );

//             if (target) {
//               const receiverConversations = await getConversationsForUser(
//                 receiverId
//               );
//               target.send(
//                 JSON.stringify({
//                   type: "member-conversation",
//                   conversations: receiverConversations,
//                 })
//               );
//             }

//             const senderConversations = await getConversationsForUser(userId);
//             ws.send(
//               JSON.stringify({
//                 type: "member-conversation",
//                 conversations: senderConversations,
//               })
//             );

//             break;
//           }

//           case "member-conversation": {
//             const conversations = await prisma.room.findMany({
//               where: {
//                 OR: [{ user1Id: userId }, { user2Id: userId }],
//               },
//               orderBy: { updatedAt: "desc" },
//               include: {
//                 user1: {
//                   select: {
//                     id: true,
//                     userName: true,
//                     profileImage: true,
//                   },
//                 },
//                 user2: {
//                   select: {
//                     id: true,
//                     userName: true,
//                     profileImage: true,
//                   },
//                 },
//               },
//             });

//             const connectedUserIds = Array.from(connectedUsers)
//               .map((ws) => ws.userId)
//               .filter((id) => id !== undefined);

//             const formattedConversations = await Promise.all(
//               conversations.map(async (room) => {
//                 const partner =
//                   room.user1Id === userId ? room.user2 : room.user1;
//                 const isActive = connectedUserIds.includes(
//                   partner?.id as string
//                 );

//                 const redisKey = `room:${room.id}:messages`;
//                 const unreadKey = `room:${room.id}:unread:${userId}`;

//                 // Get the latest message from Redis (most recent at the end)
//                 const latestRaw = await redisClient.lRange(redisKey, -1, -1);
//                 const latestMsg =
//                   latestRaw.length > 0 ? JSON.parse(latestRaw[0]) : null;

//                 // Get unread count from Redis
//                 const unreadCountStr = await redisClient.get(unreadKey);
//                 const unreadCount = parseInt(unreadCountStr || "0", 30);

//                 const latestMessage = latestMsg
//                   ? {
//                       content:
//                         latestMsg.content ??
//                         (latestMsg.fileUrl ? "sent file" : null),
//                       createdAt: latestMsg.createdAt,
//                     }
//                   : null;

//                 return {
//                   roomId: room.id,
//                   partner: {
//                     id: partner?.id,
//                     userName: partner?.userName,
//                     profileImage: partner?.profileImage,
//                     isActive,
//                   },
//                   lastMessage: latestMessage,
//                   unreadCount,
//                 };
//               })
//             );

//             ws.send(
//               JSON.stringify({
//                 type: "member-conversation",
//                 conversations: formattedConversations,
//               })
//             );

//             break;
//           }

//           default:
//             ws.send(
//               JSON.stringify({ type: "error", message: "Invalid message type" })
//             );
//         }
//       } catch (err: unknown) {
//         if (err instanceof SyntaxError) {
//           ws.send(JSON.stringify({ type: "error", message: "Bad JSON" }));
//         } else if (err instanceof Error) {
//           ws.send(JSON.stringify({ type: "error", message: err }));
//         } else {
//           ws.send(
//             JSON.stringify({ type: "error", message: "Unexpected error" })
//           );
//         }
//       }
//     });

//     ws.on("close", async () => {
//       connectedUsers?.delete(ws);

//       if (roomId) {
//         const clients = roomUsers.get(roomId);
//         clients?.delete(ws);
//         if (clients?.size === 0) roomUsers.delete(roomId);
//       }
//       console.log("WebSocket client disconnected!");
//       clearInterval(interval);
//     });
//   });
// }

// export const socket = { wss, roomUsers };
import { WebSocket, WebSocketServer } from "ws";
import { Request } from "express";
import prisma from "../../../shared/prisma";
import { verifyWebSocketToken } from "./socket.service";
import { parse } from "url";
import redisClient from "../../../helpers/redis";

interface CustomWebSocket extends WebSocket {
  userId?: string;
}

const roomUsers = new Map<string, Set<WebSocket>>();
const groupUsers = new Map<string, Set<WebSocket>>();
const connectedUsers = new Set<CustomWebSocket>();
let wss;

export function setupWebSocketServer(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: CustomWebSocket, req: Request) => {
    const { query } = parse(req.url!, true);
    let authToken = req.headers["x-token"] as string;
    if (!authToken && query["x-token"]) {
      authToken = Array.isArray(query["x-token"])
        ? query["x-token"][0]
        : query["x-token"];
    }
    if (!authToken) {
      console.log("No token provided — closing connection");
      ws.close();
      return;
    }
    const decoded = verifyWebSocketToken(ws, authToken);
    if (!decoded) {
      return;
    }
    const userId = decoded.id;
    ws.userId = userId;
    connectedUsers.add(ws);
    // Save the socket for later
    if (!roomUsers.has(userId)) roomUsers.set(userId, new Set());
    roomUsers.get(userId)?.add(ws);
    if (!groupUsers.has(userId)) groupUsers.set(userId, new Set());
    groupUsers.get(userId)?.add(ws);

    let roomId: string | null = null;

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);

    const conversations = await prisma.room.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user1: {
          select: { id: true, userName: true, profileImage: true },
        },
        user2: {
          select: { id: true, userName: true, profileImage: true },
        },
      },
    });
    const connectedUserIds = Array.from(connectedUsers)
      .map((ws) => ws.userId)
      .filter((id) => id !== undefined);

    const formattedConversations = await Promise.all(
      conversations.map(async (room) => {
        const partner = room.user1Id === userId ? room.user2 : room.user1;
        const isActive = connectedUserIds.includes(partner?.id as string);

        const redisKey = `room:${room.id}:messages`;
        const unreadKey = `room:${room.id}:unread:${userId}`;

        const [redisRaw, unreadCountStr] = await Promise.all([
          redisClient.lRange(redisKey, 0, -1),
          redisClient.get(unreadKey),
        ]);

        const unreadCount = parseInt(unreadCountStr || "0", 30);
        let latestMessage = null;

        if (redisRaw.length > 0) {
          const redisMessages = redisRaw.map((msg:any) => JSON.parse(msg));

          // Sort by createdAt descending
          redisMessages.sort(
            (a:any, b:any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const latestRedisMsg = redisMessages[0];

          latestMessage = {
            content:
              latestRedisMsg.content ??
              (latestRedisMsg.fileUrl ? "sent file" : null),
            createdAt: latestRedisMsg.createdAt,
          };
        }

        return {
          roomId: room.id,
          partner: {
            id: partner?.id,
            userName: partner?.userName,
            profileImage: partner?.profileImage,
            isActive,
          },
          lastMessage: latestMessage,
          unreadCount, // From Redis
        };
      })
    );
    ws.send(
      JSON.stringify({
        type: "member-conversation",
        conversations: formattedConversations,
      })
    );

    ws.on("message", async (message: any) => {
      try {
        const { type, receiverId, content, fileUrl } = JSON.parse(
          message.toString()
        );

        const getConversationsForUser = async (targetUserId: string) => {
          const rooms = await prisma.room.findMany({
            where: {
              OR: [{ user1Id: targetUserId }, { user2Id: targetUserId }],
            },
            orderBy: { updatedAt: "desc" },
            include: {
              user1: {
                select: { id: true, userName: true, profileImage: true },
              },
              user2: {
                select: { id: true, userName: true, profileImage: true },
              },
            },
          });

          return Promise.all(
            rooms.map(async (room) => {
              const partner =
                room.user1Id === targetUserId ? room.user2 : room.user1;
              const isActive = connectedUserIds.includes(partner?.id as string);

              const redisKey = `room:${room.id}:messages`;
              const unreadKey = `room:${room.id}:unread:${targetUserId}`;

              // Get the latest message from Redis
              const buffered = await redisClient.lRange(redisKey, -1, -1);
              const lastMessage =
                buffered.length > 0 ? JSON.parse(buffered[0]) : null;

              // Get unread count from Redis (fallback to 0 if not found)
              const unreadCountStr = await redisClient.get(unreadKey);
              const unreadCount = parseInt(unreadCountStr || "0", 30);

              // Determine content
              const lastMessageContent =
                lastMessage?.content ||
                (lastMessage?.fileUrl?.length > 0 ? "sent file" : null);

              return {
                roomId: room.id,
                partner: {
                  id: partner?.id,
                  userName: partner?.userName,
                  profileImage: partner?.profileImage,
                  isActive,
                },
                lastMessage: lastMessage
                  ? {
                      content: lastMessageContent,
                      createdAt: lastMessage?.createdAt || null,
                    }
                  : null,
                unreadCount,
              };
            })
          );
        };

        switch (type) {
          case "member-subscribe": {
            if (!receiverId) {
              return ws.send(
                JSON.stringify({
                  type: "error",
                  message: "receiverId is required",
                })
              );
            }

            let room =
              (await prisma.room.findFirst({
                where: {
                  OR: [
                    { user1Id: userId, user2Id: receiverId },
                    { user1Id: receiverId, user2Id: userId },
                  ],
                },
              })) ||
              (await prisma.room.create({
                data: { user1Id: userId, user2Id: receiverId },
              }));

            roomId = room.id;

            const unreadKey = `room:${roomId}:unread:${userId}`;
            await redisClient.set(unreadKey, "0");

            roomUsers.forEach((clients, key) => {
              if (clients.has(ws)) {
                clients.delete(ws);
                if (clients.size === 0) roomUsers.delete(key);
              }
            });

            if (!roomUsers.has(roomId)) {
              roomUsers.set(roomId, new Set());
            }
            roomUsers.get(roomId)?.add(ws);

            const redisKey = `room:${roomId}:messages`;
            const redisRaw = await redisClient.lRange(redisKey, -30, -1);
            const messages = redisRaw.reverse().map((msg:any) => JSON.parse(msg));

            ws.send(
              JSON.stringify({
                type: "past-messages",
                roomId,
                messages: messages,
              })
            );

            const senderConversations = await getConversationsForUser(userId);
            ws.send(
              JSON.stringify({
                type: "member-conversation",
                conversations: senderConversations,
              })
            );

            break;
          }

          case "member-send-message": {
            if (!roomId) {
              return ws.send(
                JSON.stringify({
                  type: "error",
                  message: "You are not subscribed to any room",
                })
              );
            }

            const roomInfo = await prisma.room.findUnique({
              where: { id: roomId },
              select: { user1Id: true, user2Id: true },
            });

            if (!roomInfo) {
              return ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Room not found",
                })
              );
            }

            const messagePayload = {
              content,
              user1Id: userId,
              user2Id: receiverId,
              roomId,
              fileUrl: fileUrl ?? [""],
              createdAt: new Date().toISOString(),
            };

            const redisKey = `room:${roomId}:messages`;
            await redisClient.rPush(redisKey, JSON.stringify(messagePayload));
            const unreadKey = `room:${roomId}:unread:${receiverId}`;
            await redisClient.incr(unreadKey);
            const count = await redisClient.lLen(redisKey);

            if (count >= 30) {
              const messagesToSaveRaw = await redisClient.lRange(
                redisKey,
                0,
                14
              );
              const messagesToSave = messagesToSaveRaw.map((msg:any) =>
                JSON.parse(msg)
              );

              await prisma.message.createMany({ data: messagesToSave });

              await redisClient.lTrim(redisKey, 15, -1);
            }

            // Update the room's updatedAt
            await prisma.room.update({
              where: {
                id: roomId,
              },
              data: {
                updatedAt: new Date(),
              },
            });

            // Broadcast message to all room clients
            roomUsers.get(roomId)?.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "member-new-message",
                    message: messagePayload,
                    roomId,
                  })
                );
              }
            });

            // Send updated conversation list to receiver (if online)
            const target = Array.from(connectedUsers).find(
              (client) => client.userId === receiverId
            );

            if (target) {
              const receiverConversations = await getConversationsForUser(
                receiverId
              );
              target.send(
                JSON.stringify({
                  type: "member-conversation",
                  conversations: receiverConversations,
                })
              );
            }

            const senderConversations = await getConversationsForUser(userId);
            ws.send(
              JSON.stringify({
                type: "member-conversation",
                conversations: senderConversations,
              })
            );

            break;
          }

          case "member-conversation": {
            const conversations = await prisma.room.findMany({
              where: {
                OR: [{ user1Id: userId }, { user2Id: userId }],
              },
              orderBy: { updatedAt: "desc" },
              include: {
                user1: {
                  select: { id: true, userName: true, profileImage: true },
                },
                user2: {
                  select: { id: true, userName: true, profileImage: true },
                },
              },
            });

            const connectedUserIds = Array.from(connectedUsers)
              .map((ws) => ws.userId)
              .filter((id) => id !== undefined);

            const formattedConversations = await Promise.all(
              conversations.map(async (room) => {
                const partner =
                  room.user1Id === userId ? room.user2 : room.user1;
                const isActive = connectedUserIds.includes(
                  partner?.id as string
                );

                const redisKey = `room:${room.id}:messages`;
                const unreadKey = `room:${room.id}:unread:${userId}`;

                // Get the latest message from Redis (most recent at the end)
                const latestRaw = await redisClient.lRange(redisKey, -1, -1);
                const latestMsg =
                  latestRaw.length > 0 ? JSON.parse(latestRaw[0]) : null;

                // Get unread count from Redis
                const unreadCountStr = await redisClient.get(unreadKey);
                const unreadCount = parseInt(unreadCountStr || "0", 30);

                const latestMessage = latestMsg
                  ? {
                      content:
                        latestMsg.content ??
                        (latestMsg.fileUrl ? "sent file" : null),
                      createdAt: latestMsg.createdAt,
                    }
                  : null;

                return {
                  roomId: room.id,
                  partner: {
                    id: partner?.id,
                    userName: partner?.userName,
                    profileImage: partner?.profileImage,
                    isActive,
                  },
                  lastMessage: latestMessage,
                  unreadCount,
                };
              })
            );

            ws.send(
              JSON.stringify({
                type: "member-conversation",
                conversations: formattedConversations,
              })
            );

            break;
          }

          default:
            ws.send(
              JSON.stringify({ type: "error", message: "Invalid message type" })
            );
        }
      } catch (err: unknown) {
        if (err instanceof SyntaxError) {
          ws.send(JSON.stringify({ type: "error", message: "Bad JSON" }));
        } else if (err instanceof Error) {
          ws.send(JSON.stringify({ type: "error", message: err }));
        } else {
          ws.send(
            JSON.stringify({ type: "error", message: "Unexpected error" })
          );
        }
      }
    });

    ws.on("close", async () => {
      connectedUsers?.delete(ws);

      if (roomId) {
        const clients = roomUsers.get(roomId);
        clients?.delete(ws);
        if (clients?.size === 0) roomUsers.delete(roomId);
      }
      console.log("WebSocket client disconnected!");
      clearInterval(interval);
    });
  });
}

export const socket = { wss, roomUsers };

